export const addPropertiesToNestedTree = <T extends { children?: T[] }>(
  data: T[],
  propertyToAdd?: Record<string, any>,
): T[] => {
  if (!data || !data.length) return [];
  return data.map((category) => ({
    ...category,
    ...(propertyToAdd || {}),
    children: category.children ? addPropertiesToNestedTree(category.children, propertyToAdd) : [],
  }));
};

export const pickPropertiesFromNestedTree = <T extends { children?: T[] }>(data: T[], propertyToPick: (keyof T)[]) => {
  if (!data || !data.length) return [];
  return data.map((category) => ({
    ...propertyToPick.reduce((acc, curr) => {
      if (category[curr]) {
        acc[curr] = category[curr];
      }
      return acc;
    }, {} as T),
    ...(category.children && category.children.length
      ? { children: pickPropertiesFromNestedTree(category.children, propertyToPick) }
      : {}),
  }));
};
