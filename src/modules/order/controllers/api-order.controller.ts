import { Controller, Post, Body, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, In, MoreThan } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ProductMetaService } from '../../product/services/product-meta.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { DiscountEntity } from '@/modules/discount/entity/discount.entity';
import { PaymentMethodService } from '@/modules/payment-method/services/payment-method.service';
import { TransactionService } from '@/modules/transaction/services/transaction.service';
import { faker } from '@faker-js/faker';
import { PaypalService } from '@/common/module/payment/paypal.service';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';
import { SchoolDiscountEntity } from '@/modules/school-discount/entities/schoolDiscount.entity';

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
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const { paymentMethodId } = createOrderDto;
    const { schoolId } = req.currentUser;

    const paymentMethod = await this.paymentMethodService.findOne({ where: { id: paymentMethodId, isActive: true } });
    if (!paymentMethod) throw new BadRequestException('Sorry, failed to place order. Please try again later.');

    return await this.dataSource.transaction(async (entityManager) => {
      const { id: userId } = req.currentUser;
      const productMetas = await this.productMetaService.find({
        where: { id: In(createOrderDto.productMetaIds.map(({ id }) => id)) },
      });

      await this.productMetaService.validateQuantity(productMetas, createOrderDto);
      await this.productMetaService.updateStock(createOrderDto);

      let totalPrice = this.orderItemService.calculateTotalPrice(productMetas, createOrderDto);

      const discount = await this.schoolDiscountService.findOne({
        where: { schoolId },
      });

      if (discount) {
        totalPrice = totalPrice * (1 - discount.discountPercentage / 100);
      }

      const order = await entityManager.save(OrderEntity, {
        totalPrice,
        user: {
          id: userId,
        },
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
      order.orderItems = createdOrderItems;

      await entityManager.save(OrderItemEntity, createdOrderItems);

      const paypalPaymentPayload = await this.paypalService.createPayment([
        {
          amount: {
            currency_code: 'SGD',
            value: (totalPrice / 100).toFixed(2),
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
