import { Injectable } from '@nestjs/common';
import { FindTreeOptions, TreeRepository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../dto';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}
}
