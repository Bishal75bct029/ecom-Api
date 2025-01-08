import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities';

@Injectable()
export class ProductRepository extends AbstractService<ProductEntity> {
  constructor(@InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>) {
    super(productRepository);
  }
}
