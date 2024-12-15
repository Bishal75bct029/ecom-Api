import { BadRequestException, Injectable } from '@nestjs/common';

import { CategoryRepository } from '../repositories/category.repository';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoryService extends CategoryRepository {
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

  async checkUniqueParentName(name: string) {
    const trees = await this.findTrees({ depth: 1 });
    const isNameNotUnique = trees.some((tree) => tree.name.toLowerCase() === name.trim().toLowerCase());
    if (isNameNotUnique) {
      throw new BadRequestException('Parent category name must be unique.');
    }
  }
}
