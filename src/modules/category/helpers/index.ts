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
