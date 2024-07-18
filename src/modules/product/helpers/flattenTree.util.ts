import { CategoryEntity } from '@/modules/category/entities/category.entity';

export function getAllTreeIds(tree: CategoryEntity): string[] {
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

export function flatAncestor(tree: CategoryEntity): CategoryEntity[] {
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
