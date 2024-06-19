import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { CategoryEntity } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindTreeOptions, TreeRepository } from 'typeorm';

@Injectable()
export class CategoryService extends AbstractService<CategoryEntity> {
  constructor(@InjectRepository(CategoryEntity) private readonly itemRepository: TreeRepository<CategoryEntity>) {
    super(itemRepository);
  }

  async findTrees(options: FindTreeOptions = {}) {
    return this.itemRepository.findTrees(options);
  }

  async findDescendantsTree(entity: CategoryEntity, options: FindTreeOptions = {}) {
    return this.itemRepository.findDescendantsTree(entity, options);
  }

  async findAncestorsTree(entity: CategoryEntity, options: FindTreeOptions = {}) {
    return this.itemRepository.findAncestorsTree(entity, options);
  }
}
