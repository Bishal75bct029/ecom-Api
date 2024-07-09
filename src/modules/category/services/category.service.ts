import { BadRequestException, Injectable } from '@nestjs/common';
import { FindTreeOptions, TreeRepository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../dto';

@Injectable()
export class CategoryService extends CategoryRepository {
  async saveCategory(category: CreateCategoryDto) {
    if (!category.parent) {
      return this.createAndSave({ name: category.name, image: category.image });
    }
    const parentCategory = await this.findOne({ where: { parent: { id: category.parent } } });
    if (!parentCategory) throw new BadRequestException('Category parent not found');

    return this.createAndSave({ name: category.name, parent: parentCategory });
  }
}
