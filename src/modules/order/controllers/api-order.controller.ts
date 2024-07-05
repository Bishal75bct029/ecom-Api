import { Controller, Post, Body, Req, Get, Query, Put } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, In } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UserService } from '../../user/services/user.service';
import { ProductMetaService } from '../../product/services/product-meta.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderEntity, OrderStatusEnum } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { UserRoleEnum } from '@/modules/user/entities';
import { OrderService } from '../services/order.service';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Controller('api/orders')
export class ApiOrderController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderItemService: OrderItemService,
    private readonly orderService: OrderService,
    private readonly userService: UserService,
    private readonly productMetaService: ProductMetaService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    return await this.dataSource.transaction(async (entityManager) => {
      const { id: userId } = req.currentUser;

      const productMetas = await this.productMetaService.find({
        where: { id: In(createOrderDto.productMetaIds.map(({ id }) => id)) },
      });

      const totalPrice = createOrderDto.productMetaIds.reduce((acc, { quantity, id }) => {
        const pricePerUnit = productMetas.find((meta) => meta.id === id).price;

        return acc + quantity * pricePerUnit;
      }, 0);

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
