import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductMetaEntity } from '../entities';

@Injectable()
export class ProductMetaService extends AbstractService<ProductMetaEntity> {
  constructor(@InjectRepository(ProductMetaEntity) private readonly itemRepository: Repository<ProductMetaEntity>) {
    super(itemRepository);
  }
}
