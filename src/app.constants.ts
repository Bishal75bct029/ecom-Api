export const ADMIN_PUBLIC_ROUTES = [
  'admin/users/create',
  'admin/users/logout',
  'admin/users/refresh',
  'admin/users/authenticate',
  'admin/users/validate-login-otp',
  'admin/users/validate-password-otp',
  'admin/users/forgot-password',
  'admin/users/reset-password',
];

export const API_PUBLIC_ROUTES = [
  'api/users/login',
  'api/users/logout',
  'api/users/refresh',
  'api/users/create',
  'api/categories',
];

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');
