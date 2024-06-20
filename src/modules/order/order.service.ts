import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderService extends AbstractService<OrderEntity> {
  constructor(@InjectRepository(OrderEntity) private readonly itemRepository: Repository<OrderEntity>) {
    super(itemRepository);
  }
}
