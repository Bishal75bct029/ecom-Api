import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateUpdateCategoryDto, UpdateCategoryDto } from '../dto';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoryService extends CategoryRepository {
  async saveCategory(category: CreateUpdateCategoryDto) {
    if (!category.parent) {
      return this.createAndSave({ name: category.name, image: category.image });
    }
    const parentCategory = await this.findOne({ where: { parent: { id: category.parent } } });
    if (!parentCategory) throw new BadRequestException('Category parent not found');

    return this.createAndSave({ name: category.name, parent: parentCategory });
  }

  async updateCategory(updateCategory: UpdateCategoryDto, id: string) {
    const category = await this.findOne({ where: { id } });
    if (!category) throw new BadRequestException('Category not found');
    await this.createAndSave({ id, ...updateCategory });

    return this.findDescendantsTree(category);
  }

  getIdsFromParent(category: CategoryEntity) {
    return this.extractIds(category);
  }

  private extractIds(obj: any) {
    let ids = [];

    if (obj.hasOwnProperty('id')) {
      ids.push(obj.id);
    }

    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        ids = ids.concat(this.extractIds(obj[key]));
      }
    }
    return ids;
  }
}
