import { AbstractService } from '@/libs/service/abstract.service';
import { Injectable } from '@nestjs/common';
import { DiscountEntity } from '../entity/discount.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DiscountService extends AbstractService<DiscountEntity> {
  constructor(@InjectRepository(DiscountEntity) private readonly discountRepository: Repository<DiscountEntity>) {
    super(discountRepository);
  }
}
