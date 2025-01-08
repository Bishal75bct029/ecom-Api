import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindTreeOptions, TreeRepository } from 'typeorm';
import { AbstractService } from '@/libs/service/abstract.service';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoryRepository extends AbstractService<CategoryEntity> {
  constructor(@InjectRepository(CategoryEntity) private readonly categoryRepository: TreeRepository<CategoryEntity>) {
    super(categoryRepository);
  }

  async findTrees(options: FindTreeOptions = {}) {
    return this.categoryRepository.findTrees(options);
  }

  async findDescendantsTree(entity: CategoryEntity, options: FindTreeOptions = {}) {
    return this.categoryRepository.findDescendantsTree(entity, options);
  }

  async findAncestorsTree(entity: CategoryEntity, options: FindTreeOptions = {}) {
    return this.categoryRepository.findAncestorsTree(entity, options);
  }
}
