export const getRoundedOffValue = (num: number | bigint): number => {
  if (typeof num === 'bigint') {
    const intNum = Number(num);
    return parseFloat((intNum * 100).toFixed(2));
  }

  return parseFloat((num * 100).toFixed(2));
};
