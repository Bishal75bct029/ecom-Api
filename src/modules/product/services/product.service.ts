import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities';

@Injectable()
export class ProductService extends AbstractService<ProductEntity> {
  constructor(@InjectRepository(ProductEntity) private readonly itemRepository: Repository<ProductEntity>) {
    super(itemRepository);
  }
}
