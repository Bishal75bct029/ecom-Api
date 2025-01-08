import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from '@/libs/service/abstract.service';
import { Repository } from 'typeorm';
import { SchoolDiscountEntity } from '../entities/schoolDiscount.entity';

@Injectable()
export class SchoolDiscountRepository extends AbstractService<SchoolDiscountEntity> {
  constructor(
    @InjectRepository(SchoolDiscountEntity) private readonly schoolDiscountRepository: Repository<SchoolDiscountEntity>,
  ) {
    super(schoolDiscountRepository);
  }
}
