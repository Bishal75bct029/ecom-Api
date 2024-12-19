import { match } from 'path-to-regexp';

export const getPatternMatchingRoute = <T extends { path: string; method: string }>(
  routes: T[],
  path: string,
  method: string,
): T => {
  const route = routes.find((route) => {
    const isMatch = match(route.path, { decode: decodeURIComponent });
    return !!isMatch(path) && method.localeCompare(route.method, undefined, { sensitivity: 'base' }) === 0;
  });
  return route;
};
