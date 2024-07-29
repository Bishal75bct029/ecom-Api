export const getRoundedOffValue = (num: number): number => {
  return parseFloat((num * 100).toFixed(2));
};
