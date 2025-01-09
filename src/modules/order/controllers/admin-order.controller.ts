import { Controller, Body, Put, Param, BadRequestException, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource, In } from 'typeorm';

import { OrderService } from '../services/order.service';
import { UpdateOrderStatusDto } from '../dto/update-order.dto';
import { ProductMetaService } from '../../product/services/product-meta.service';
import { ProductMetaEntity } from '../../product/entities/productMeta.entity';
import { ValidateIDDto } from '@/common/dtos';
import { OrderItemService } from '../services/order-item.service';
import { OrderItemEntity, OrderStatusEnum } from '../entities/order-item.entity';

@ApiTags('Admin Order')
@Controller('admin/orders')
export class AdminOrderController {
  constructor(
    private dataSource: DataSource,
    private readonly orderService: OrderService,
    private readonly orderItemService: OrderItemService,
    private readonly productMetaService: ProductMetaService,
  ) {}

  @Get()
  async getOrders(@Query() query: Pagination) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const [orders, count] = await this.orderService.findAndCount({
      take: limit,
      skip: Math.floor(limit * (page - 1)),
      relations: ['orderItems'],
      select: {
        id: true,
        orderItems: {
          pricePerUnit: true,
          status: true,
          id: true,
        },
      },
    });

    return { orders, count, totalPage: Math.ceil(count / limit) };
  }

  @Put(':id/status')
  async update(@Body() updateOrderStatusDto: UpdateOrderStatusDto, @Param() { id }: ValidateIDDto) {
    const { status, orderItemId } = updateOrderStatusDto;

    const order = await this.orderService.findOne({
      where: { id },
      relations: { orderItems: { productMeta: true } },
    });

    if (!order) throw new BadRequestException('Order not found');

    let isUpdated = false;
    let orderItem: OrderItemEntity;
    if (orderItemId) {
      orderItem = order.orderItems.find((item) => orderItemId === item.id);
      if (!this.orderItemService.isValidStatusTransition(orderItem.status, status))
        throw new BadRequestException('Invalid status transition');
    } else {
      if (!this.orderService.isOrderCancellable(status, order.orderItems))
        throw new BadRequestException('Invalid status transition');
    }

    // increase product quantity when status is Cancelled
    await this.dataSource.transaction(async (entityManager) => {
      if (status === OrderStatusEnum.CANCELLED) {
        const orderItemsIds = order.orderItems.map((orderItem) => orderItem.id);
        const productMetas = await this.productMetaService.find({
          where: { id: In(orderItemsIds) },
        });
        productMetas.forEach((productMeta) => {
          productMeta.stock =
            productMeta.stock + order.orderItems.find((item) => item.productMeta.id === productMeta.id).quantity;
        });

        const createdOrderItems = this.orderItemService.createMany(
          order.orderItems.map((item) => ({ ...item, status: OrderStatusEnum.CANCELLED })),
        );
        await Promise.all([
          entityManager.save(OrderItemEntity, createdOrderItems),
          entityManager.save(ProductMetaEntity, productMetas),
        ]);

        isUpdated = true;
      }

      if (orderItem) {
        await entityManager.save(OrderItemEntity, { ...orderItem, status });
        isUpdated = true;
      }
    });

    if (isUpdated) {
      return { message: 'Order status updated successfully' };
    }

    throw new BadRequestException('Invalid request');
  }
}
