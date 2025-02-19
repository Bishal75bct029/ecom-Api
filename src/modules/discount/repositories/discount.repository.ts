import { Injectable } from '@nestjs/common';
import { DiscountEntity } from '../entity/discount.entity';
import { AbstractService } from '@/libs/service/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DiscountRepository extends AbstractService<DiscountEntity> {
  constructor(@InjectRepository(DiscountEntity) private readonly discountRepository: Repository<DiscountEntity>) {
    super(discountRepository);
  }
}
