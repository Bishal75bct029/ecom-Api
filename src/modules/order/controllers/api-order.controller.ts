import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, In, MoreThan } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ProductMetaService } from '../../product/services/product-meta.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { DiscountService } from '@/modules/discount/services/discount.service';
import { DiscountEntity } from '@/modules/discount/entity/discount.entity';
import { PaymentMethodService } from '@/modules/payment-method/services/payment-method.service';
import { TransactionService } from '@/modules/transaction/services/transaction.service';
import { faker } from '@faker-js/faker';
import { PaypalService } from '@/common/module/payment/paypal.service';

@Controller('api/orders')
export class ApiOrderController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderItemService: OrderItemService,
    private readonly discountService: DiscountService,
    private readonly productMetaService: ProductMetaService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly transactionService: TransactionService,
    private readonly paypalService: PaypalService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const { paymentMethodId } = createOrderDto;

    const paymentMethod = await this.paymentMethodService.findOne({ where: { id: paymentMethodId, isActive: true } });
    if (!paymentMethod) throw new BadRequestException('Sorry, failed to place order. Please try again later.');

    return await this.dataSource.transaction(async (entityManager) => {
      const { id: userId } = req.currentUser;
      const productMetas = await this.productMetaService.find({
        where: { id: In(createOrderDto.productMetaIds.map(({ id }) => id)) },
      });

      await this.productMetaService.validateQuantity(productMetas, createOrderDto);
      await this.productMetaService.updateStock(createOrderDto);

      let discount: DiscountEntity;
      const totalPrice = this.orderItemService.calculateTotalPrice(productMetas, createOrderDto);

      if (createOrderDto.couponCode) {
        discount = await this.discountService.findOne({
          where: { couponCode: createOrderDto.couponCode, expiryTime: MoreThan(new Date(new Date().toISOString())) },
        });

        this.orderItemService.calculateDiscountedPrice(totalPrice, discount);
      }

      const order = await entityManager.save(OrderEntity, {
        totalPrice,
        user: {
          id: userId,
        },
        discount: {
          id: discount.id,
        },
      });

      const orderItems = productMetas.map((productMeta) => {
        const quantity = createOrderDto.productMetaIds.find(({ id }) => id === productMeta.id).quantity;

        return {
          productMeta,
          pricePerUnit: productMeta.price,
          quantity,
          totalPrice: quantity * productMeta.price,
          order,
        };
      });

      const createdOrderItems = this.orderItemService.createMany(orderItems);
      order.orderItems = createdOrderItems;

      await entityManager.save(OrderItemEntity, createdOrderItems);

      const paypalPaymentPayload = await this.paypalService.createPayment([
        {
          amount: {
            currency_code: 'SGD',
            value: totalPrice.toFixed(2),
          },
        },
      ]);

      this.transactionService.create({
        id: faker.string.uuid(),
        transactionId: paypalPaymentPayload?.result.id,
        paymentMethod,
        price: totalPrice,
        order,
        transactionCode: this.transactionService.genTransactionCode(),
        user: {
          id: userId,
        },
      });
      const approvalUrl = paypalPaymentPayload?.result.links.find((item: any) => item.rel === 'approve').href;

      return approvalUrl;
    });
  }
}
