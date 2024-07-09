import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, In, MoreThan } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ProductMetaService } from '../../product/services/product-meta.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { DiscountService } from '@/modules/discount/services/discount.service';
import { DiscountEntity } from '@/modules/discount/entity/discount.entity';

@Controller('api/orders')
export class ApiOrderController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderItemService: OrderItemService,
    private readonly discountService: DiscountService,
    private readonly productMetaService: ProductMetaService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
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

      return order;
    });
  }
}
