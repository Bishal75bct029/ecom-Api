import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';

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

  async updateCategory(updateCategory: UpdateCategoryDto, id: string) {
    const category = await this.findOne({ where: { id } });
    if (!category) throw new BadRequestException('Category not found');
    await this.createAndSave({ id, ...updateCategory });

    return this.findDescendantsTree(category);
  }
}
