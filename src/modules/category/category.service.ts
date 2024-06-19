import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { CategoryEntity } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService extends AbstractService<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity) private readonly itemRepository: Repository<CategoryEntity>,
  ) {
    super(itemRepository);
  }
}
