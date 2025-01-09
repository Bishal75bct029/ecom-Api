import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { OrderItemEntity, OrderStatusEnum } from '../entities/order-item.entity';

@Injectable()
export class OrderService extends OrderRepository {
  isOrderCancellable(newStatus: OrderStatusEnum, orderItems: OrderItemEntity[]) {
    const isAnyItemShipped = orderItems.some((orderItem) => orderItem.status !== OrderStatusEnum.PLACED);
    if (isAnyItemShipped || newStatus !== OrderStatusEnum.CANCELLED) return false;

    return true;
  }
}
