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

export const getRecursiveDataArrayFromObjectOrArray = ({
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

export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
