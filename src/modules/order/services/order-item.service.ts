import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItemEntity } from '../entities/order-item.entity';

@Injectable()
export class OrderItemService extends AbstractService<OrderItemEntity> {
  constructor(@InjectRepository(OrderItemEntity) private readonly itemRepository: Repository<OrderItemEntity>) {
    super(itemRepository);
  }
}
