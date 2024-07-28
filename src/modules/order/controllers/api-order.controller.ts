import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, In } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ProductMetaService } from '@/modules/product/services/product-meta.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { PaymentMethodService } from '@/modules/payment-method/services/payment-method.service';
import { TransactionService } from '@/modules/transaction/services/transaction.service';
import { PaypalService } from '@/common/module/payment/paypal.service';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';
import { ProductMetaEntity } from '@/modules/product/entities';
import { TransactionEntity } from '@/modules/transaction/entities/transaction.entity';
import { CartService } from '@/modules/cart/services/cart.service';
import { CartEntity } from '@/modules/cart/entities/cart.entity';

@Controller('api/orders')
export class ApiOrderController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderItemService: OrderItemService,
    private readonly schoolDiscountService: SchoolDiscountService,
    private readonly productMetaService: ProductMetaService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly transactionService: TransactionService,
    private readonly paypalService: PaypalService,
    private readonly cartService: CartService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const { paymentMethodId } = createOrderDto;
    const { schoolId, id: userId } = req.currentUser;

    //initial validations
    const [paymentMethod, productMetas] = await Promise.all([
      this.paymentMethodService.findOne({ where: { id: paymentMethodId, isActive: true } }),
      this.productMetaService.find({
        where: { id: In(createOrderDto.productMetaIds.map(({ id }) => id)) },
      }),
    ]);

    if (
      !paymentMethod ||
      productMetas.length === 0 ||
      productMetas.length !== createOrderDto.productMetaIds.length ||
      !userId
    )
      throw new BadRequestException('Sorry, failed to place order. Please try again later.');

    /** Transaction */
    return await this.dataSource.transaction(async (entityManager) => {
      //validate qunatities
      this.productMetaService.validateQuantity(productMetas, createOrderDto);

      //decrease quantity in product meta
      const decreaseProductMetaQuantities = productMetas.map((product) => {
        const productFromOrder = createOrderDto.productMetaIds.find((item) => item.id === product.id);
        return { ...product, stock: product.stock - productFromOrder.quantity };
      });
      await entityManager.save(ProductMetaEntity, decreaseProductMetaQuantities);

      //calculate total price with discount if any
      let totalPrice = this.orderItemService.calculateTotalPrice(productMetas, createOrderDto) * 100;
      const discount = await this.schoolDiscountService.findOne({ where: { schoolId } });
      if (discount) {
        totalPrice = totalPrice * (1 - discount.discountPercentage / 100);
      }

      //save order and order items
      const order = await entityManager.save(OrderEntity, {
        totalPrice,
        user: { id: userId },
      });
      const orderItems = productMetas.map((productMeta) => {
        const quantity = createOrderDto.productMetaIds.find(({ id }) => id === productMeta.id).quantity;
        return {
          productMeta,
          pricePerUnit: productMeta.price,
          quantity,
          totalPrice,
          order,
        };
      });
      const createdOrderItems = this.orderItemService.createMany(orderItems);
      await entityManager.save(OrderItemEntity, createdOrderItems);

      //create paypal payment intent
      const [paypalPaymentPayload, userCart] = await Promise.all([
        this.paypalService.createPayment([
          {
            amount: {
              currency_code: 'SGD',
              value: (totalPrice / 100).toFixed(2),
            },
          },
        ]),
        this.cartService.findOne({ where: { user: { id: userId } } }),
      ]);

      //cart query
      let promisifiedCart: Promise<CartEntity>;
      if (userCart) {
        promisifiedCart = entityManager.save(CartEntity, {
          ...userCart,
          productMetaId: userCart.productMetaId.filter((metaId) => !productMetas.map(({ id }) => id).includes(metaId)),
        });
      }

      //save transaction and cart update
      await Promise.all([
        entityManager.save(TransactionEntity, {
          transactionId: paypalPaymentPayload?.result.id,
          paymentMethod,
          price: totalPrice,
          order,
          transactionCode: this.transactionService.genTransactionCode(),
          user: { id: userId },
          responseJson: paypalPaymentPayload,
        }),
        promisifiedCart,
      ]);

      const approvalUrl = paypalPaymentPayload?.result.links.find((item: any) => item.rel === 'approve').href;
      return { approvalUrl };
    });
  }
}
