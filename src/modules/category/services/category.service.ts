import { Injectable } from '@nestjs/common';

import { CategoryRepository } from '../repositories/category.repository';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoryService extends CategoryRepository {
  getIdsFromParent(category: CategoryEntity): string[] {
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

  findLastCategory(categories: CategoryEntity[]) {
    if (categories.length === 0) return null;

    const categoryMap = new Map<string, CategoryEntity[]>();
    let rootCategory: CategoryEntity | null = null;

    for (const category of categories) {
      if (!category.id) continue;

      if (category.parent === null) {
        rootCategory = category;
      } else {
        const parentId = category.parent.id;
        if (!categoryMap.has(parentId)) {
          categoryMap.set(parentId, []);
        }
        categoryMap.get(parentId)!.push(category);
      }
    }

    if (!rootCategory) return null;

    const findLast = (category: CategoryEntity): string => {
      const children = categoryMap.get(category.id) || [];
      if (children.length === 0) {
        return category.id;
      }
      return findLast(children[children.length - 1]);
    };

    return findLast(rootCategory);
  }
}
