import { Injectable } from '@nestjs/common';
import { OrderStatusEnum } from '../entities/order.entity';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ProductMetaEntity } from '@/modules/product/entities';

@Injectable()
export class OrderService extends OrderRepository {
  private _statusTransitions: Record<OrderStatusEnum, OrderStatusEnum[]> = {
    [OrderStatusEnum.PLACED]: [OrderStatusEnum.PACKED, OrderStatusEnum.CANCELLED],
    [OrderStatusEnum.PACKED]: [OrderStatusEnum.SHIPPED, OrderStatusEnum.CANCELLED],
    [OrderStatusEnum.SHIPPED]: [OrderStatusEnum.DELIVERED, OrderStatusEnum.CANCELLED],
    [OrderStatusEnum.DELIVERED]: [],
    [OrderStatusEnum.CANCELLED]: [],
  };

  isValidStatusTransition(currentStatus: OrderStatusEnum, newStatus: OrderStatusEnum) {
    const allowedTransitions = this._statusTransitions[currentStatus];
    return allowedTransitions.includes(newStatus);
  }
}
