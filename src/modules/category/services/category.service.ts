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
    const hasCreatedAt = (item: T): item is T & { createdAt: Date } => {
      return 'createdAt' in item && item.createdAt instanceof Date;
    };

    if (propertyToPick.includes('createdAt' as keyof T)) {
      data = data.sort((a, b) => {
        if (hasCreatedAt(a) && hasCreatedAt(b)) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        return 0;
      });
    }

    return data.map((category) => ({
      ...propertyToPick.reduce((acc, curr) => {
        if (category[curr] && curr !== 'createdAt') {
          acc[curr] = category[curr];
        }
        return acc;
      }, {} as T),
      ...(category.children && category.children.length
        ? { children: this.pickPropertiesFromNestedTree(category.children, propertyToPick) }
        : {}),
    }));
  };

  getAllTreeIds(tree: CategoryEntity): string[] {
    const result: CategoryEntity[] = [];
    const stack: CategoryEntity[] = [tree];
    const ids: string[] = [];

    while (stack.length > 0) {
      const current = stack.pop();
      if (current) {
        result.push(current);
        ids.push(current.id);
        if (current.children && current.children.length > 0) {
          stack.push(...current.children);
        }
      }
    }

    return ids;
  }

  flatAncestor(tree: CategoryEntity): CategoryEntity[] {
    const result: CategoryEntity[] = [];
    const stack: CategoryEntity[] = [tree];

    while (stack.length > 0) {
      const current = stack.pop();
      if (current) {
        result.push(current);
        if (current.parent) {
          stack.push(current.parent);
        }
      }
    }

    return result;
  }

  getRecursiveDataArrayFromObjectOrArray = ({
    recursiveObjectKey,
    dataKey,
    recursiveData,
  }: {
    recursiveObjectKey: string;
    dataKey: string;
    recursiveData: Array<Record<string, any>> | Record<string, any>;
  }) => {
    const array = [];

    const recursiveFunc = (x: Record<string, any>) => {
      if (!array.includes(x[dataKey])) {
        array.push(x[dataKey]);
      }
      if (recursiveObjectKey in x && Object.keys(x[recursiveObjectKey]).length > 0) {
        array.push(x[recursiveObjectKey][dataKey]);
        recursiveFunc(x[recursiveObjectKey]);
      }
    };

    if (Array.isArray(recursiveData)) {
      recursiveData.forEach(recursiveFunc);
    } else {
      recursiveFunc(recursiveData);
    }

    return array;
  };

  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
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
