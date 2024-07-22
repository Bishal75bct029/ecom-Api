import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethodEntity } from '../entities/payment-method.entity';

@Injectable()
export class PaymentMethodRepository extends AbstractService<PaymentMethodEntity> {
  constructor(@InjectRepository(PaymentMethodEntity) private readonly itemRepository: Repository<PaymentMethodEntity>) {
    super(itemRepository);
  }
}
