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
