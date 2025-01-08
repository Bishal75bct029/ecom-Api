import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from '@/libs/service/abstract.service';
import { Repository } from 'typeorm';
import { OrderItemEntity } from '../entities/order-item.entity';

@Injectable()
export class OrderItemRepository extends AbstractService<OrderItemEntity> {
  constructor(@InjectRepository(OrderItemEntity) private readonly orderItemRepository: Repository<OrderItemEntity>) {
    super(orderItemRepository);
  }
}
