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

  addPropertiesToNestedTree = <T extends { children?: T[] }>(data: T[], propertyToAdd?: Record<string, any>): T[] => {
    if (!data || !data.length) return [];
    return data.map((category) => ({
      ...category,
      ...(propertyToAdd || {}),
      children: category.children ? this.addPropertiesToNestedTree(category.children, propertyToAdd) : [],
    }));
  };

  pickPropertiesFromNestedTree = <T extends { children?: T[] }>(data: T[], propertyToPick: (keyof T)[]) => {
    if (!data || !data.length) return [];
    return data.map((category) => ({
      ...propertyToPick.reduce((acc, curr) => {
        if (category[curr]) {
          acc[curr] = category[curr];
        }
        return acc;
      }, {} as T),
      ...(category.children && category.children.length
        ? { children: this.pickPropertiesFromNestedTree(category.children, propertyToPick) }
        : {}),
    }));
  };
}
