import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindTreeOptions, In, TreeRepository } from 'typeorm';
import { AbstractService } from '@/libs/service/abstract.service';
import { CategoryEntity } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';

@Injectable()
export class CategoryRepository extends AbstractService<CategoryEntity> {
  constructor(@InjectRepository(CategoryEntity) private readonly itemRepository: TreeRepository<CategoryEntity>) {
    super(itemRepository);
  }

  async updateCategory(category: UpdateCategoryDto) {
    return this.createAndSave(category);
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
