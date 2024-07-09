import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../entities/order.entity';
import { AbstractService } from '@/libs/service/abstract.service';
import { Repository } from 'typeorm';

@Injectable()
export class OrderRepository extends AbstractService<OrderEntity> {
  constructor(@InjectRepository(OrderEntity) private readonly itemRepository: Repository<OrderEntity>) {
    super(itemRepository);
  }
}
