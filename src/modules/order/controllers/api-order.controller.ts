import { Controller, Post, Body, Req, BadRequestException, Query, Get, Param } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, FindOptionsWhere, In, Not } from 'typeorm';
import { CreateOrderDto, OrderQueryDto, OrderQueryEnum } from '../dto/create-order.dto';
import { ProductMetaService } from '@/modules/product/services/product-meta.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderEntity, OrderStatusEnum } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { PaymentMethodService } from '@/modules/payment-method/services/payment-method.service';
import { TransactionService } from '@/modules/transaction/services/transaction.service';
import { PaypalService } from '@/common/module/payment/paypal.service';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';
import { ProductMetaEntity } from '@/modules/product/entities';
import { TransactionEntity } from '@/modules/transaction/entities/transaction.entity';
import { CartService } from '@/modules/cart/services/cart.service';
import { CartEntity } from '@/modules/cart/entities/cart.entity';
import { CapturePaymentDto } from '@/modules/transaction/dto/capture-payment.dto';
import { OrderService } from '../services/order.service';
import { getRoundedOffValue } from '@/common/utils';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('API Order')
@ApiBearerAuth()
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
    private readonly orderService: OrderService,
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
      let totalPrice = this.orderItemService.calculateTotalPrice(productMetas, createOrderDto);
      const discount = await this.schoolDiscountService.findOne({ where: { schoolId } });
      if (discount) {
        totalPrice = Math.floor(getRoundedOffValue((totalPrice * (1 - discount.discountPercentage / 100)) / 100));
      }

      //save order and order items
      const order = await entityManager.save(OrderEntity, {
        totalPrice,
        user: { id: userId },
      });
      const orderItems = productMetas.map((productMeta) => {
        const quantity = createOrderDto.productMetaIds.find(({ id }) => id === productMeta.id).quantity;
        const pricePerUnit = Math.floor(
          getRoundedOffValue((Number(productMeta.price) * (1 - discount.discountPercentage / 100)) / 100),
        );

        return {
          productMeta,
          pricePerUnit,
          quantity,
          totalPrice: quantity * pricePerUnit,
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
              value: (totalPrice / 10000).toFixed(2),
            },
          },
        ]),
        this.cartService.findOne({ where: { user: { id: userId } } }),
      ]);

      //cart query
      let promisifiedCart: Promise<CartEntity>;
      if (userCart && userCart.productMetaId.some((metaId) => productMetas.map(({ id }) => id).includes(metaId))) {
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
        }),
        promisifiedCart,
      ]);

      const approvalUrl = paypalPaymentPayload?.result.links.find((item: any) => item.rel === 'approve').href;
      return { approvalUrl };
    });
  }

  @Get('confirm')
  async confirmOrder(@Query() query: CapturePaymentDto) {
    const { token } = query;

    const transaction = await this.transactionService.findOne({
      where: { transactionId: token, isSuccess: false },
      relations: ['order'],
      select: { order: { id: true } },
    });
    if (!transaction) throw new BadRequestException('Sorry, failed to place order. Please try again later.');

    const paypalResponse = await this.paypalService.captureOrder(token);
    const paypalFee =
      paypalResponse.result.purchase_units[0].payments.captures[0].seller_receivable_breakdown?.paypal_fee.value || 0;

    const savedTransaction = await this.transactionService.save({
      ...transaction,
      isSuccess: true,
      responseJson: paypalResponse,
      paymentGatewayCharge: getRoundedOffValue(paypalFee * 100),
    });
    return { orderId: savedTransaction.order.id };
  }

  @Get()
  async getOrders(@Req() { currentUser }: Request, @Query() { status }: OrderQueryDto) {
    let whereClause: FindOptionsWhere<OrderEntity> = {
      user: { id: currentUser.id },
      transaction: { isSuccess: true },
    };
    if (status && status == OrderQueryEnum.PENDING) {
      whereClause = { ...whereClause, status: Not(In([OrderStatusEnum.DELIVERED, OrderStatusEnum.CANCELLED])) };
    }
    const orders = await this.orderService.find({
      where: whereClause,
      relations: ['orderItems', 'orderItems.productMeta', 'orderItems.productMeta.product', 'transaction'],
      select: {
        orderItems: {
          id: true,
          quantity: true,
          totalPrice: true,
          productMeta: {
            id: true,
            image: true,
            price: true,
            variant: {},
            product: {
              id: true,
              name: true,
            },
          },
        },
        transaction: {
          isSuccess: true,
        },
      },
    });
    return orders.map((order) => {
      return {
        ...order,
        orderItems: order.orderItems.map((orderItem) => {
          return {
            ...orderItem,
            pricePerUnit: Number(orderItem.totalPrice) / 100,
            productMeta: {
              ...orderItem.productMeta,
              price: (Number(orderItem.productMeta.price) / 100) * orderItem.quantity,
            },
          };
        }),
      };
    });
  }

  @Get(':id')
  getOrderById(@Req() { currentUser }: Request, @Param('id') id: string) {
    return this.orderService.findOne({
      where: {
        user: { id: currentUser.id },
        id,
        transaction: { isSuccess: true },
      },
      relations: ['orderItems', 'orderItems.productMeta', 'orderItems.productMeta.product'],
      select: {
        orderItems: {
          id: true,
          pricePerUnit: true,
          quantity: true,
          totalPrice: true,
          productMeta: {
            id: true,
            image: true,
            variant: {},
            product: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
        },
        transaction: { isSuccess: true },
        updatedAt: true,
      },
    });
  }
}
