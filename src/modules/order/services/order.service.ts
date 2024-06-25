import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity, OrderStatusEnum } from '../entities/order.entity';

@Injectable()
export class OrderService extends AbstractService<OrderEntity> {
  constructor(@InjectRepository(OrderEntity) private readonly itemRepository: Repository<OrderEntity>) {
    super(itemRepository);
  }

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
