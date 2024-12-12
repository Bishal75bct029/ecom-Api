import { match } from 'path-to-regexp';

export const getPatternMatchingRoute = (routes: { path: string; method: string }[], path: string, method: string) => {
  const route = routes.find((route) => {
    const isMatch = match(route.path, { decode: decodeURIComponent });
    return !!isMatch(path) && method.localeCompare(route.method, undefined, { sensitivity: 'base' }) === 0;
  });
  return route;
};
