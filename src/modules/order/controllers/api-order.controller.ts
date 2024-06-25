import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, In } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UserService } from '../../user/services/user.service';
import { ProductMetaService } from '../../product/services/product-meta.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';

@Controller('api/orders')
export class ApiOrderController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderItemService: OrderItemService,
    private readonly userService: UserService,
    private readonly productMetaService: ProductMetaService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    return await this.dataSource.transaction(async (entityManager) => {
      const { id } = req.currentUser;

      const promiseUser = this.userService.findOne({ where: { id }, select: { password: false } });

      const promiseProductMetas = this.productMetaService.find({
        where: { id: In(createOrderDto.productMetaIds.map(({ id }) => id)) },
      });

      const [user, productMetas] = await Promise.all([promiseUser, promiseProductMetas]);

      const totalPrice = createOrderDto.productMetaIds.reduce((acc, { quantity, id }) => {
        const pricePerUnit = productMetas.find((meta) => meta.id === id).price;
        return acc + quantity * pricePerUnit;
      }, 0);

      const order = await entityManager.save(OrderEntity, { totalPrice, user });
      delete order.user.password;

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
