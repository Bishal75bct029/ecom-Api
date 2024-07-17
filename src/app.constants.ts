export const ADMIN_PUBLIC_ROUTES = [
  'admin/users/create',
  'admin/users/logout',
  'admin/users/refresh',
  'admin/users/authenticate',
  'admin/users/validate-otp',
];

export const API_PUBLIC_ROUTES = ['api/users/login', 'api/users/logout', 'api/users/refresh'];

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');
