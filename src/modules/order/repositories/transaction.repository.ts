import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../entities/order.entity';
import { AbstractService } from '@/libs/service/abstract.service';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';

@Injectable()
export class TransactionRepository extends AbstractService<TransactionEntity> {
  constructor(@InjectRepository(OrderEntity) private readonly baseRepository: Repository<TransactionEntity>) {
    super(baseRepository);
  }
}
