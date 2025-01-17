import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from '@/libs/service/abstract.service';
import { Repository } from 'typeorm';
import { OrderStatusHistoryEntity } from '../entities/order-history.entity';

@Injectable()
export class OrderStatusHistoryRepository extends AbstractService<OrderStatusHistoryEntity> {
  constructor(
    @InjectRepository(OrderStatusHistoryEntity)
    private readonly orderItemRepository: Repository<OrderStatusHistoryEntity>,
  ) {
    super(orderItemRepository);
  }
}
