export const getRecursiveDataArray = (recursiveKey: string, dataKey: string) => {
  const array = [];
  const recursiveFunc = (x: Record<string, any>) => {
    if (!array.includes(x[dataKey])) {
      array.push(x[dataKey]);
    }
    if (recursiveKey in x && Object.keys(x[recursiveKey]).length > 0) {
      array.push(x[recursiveKey][dataKey]);
      recursiveFunc(x[recursiveKey]);
    }
  };
  return { recursiveFunc, array };
};
