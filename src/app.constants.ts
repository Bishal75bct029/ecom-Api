// import { envConfig } from './configs/envConfig';

export const ADMIN_PUBLIC_ROUTES = [
  'admin/users/authenticate',
  'admin/users/validate-otp',
  'admin/users/resend-otp',
  'admin/users/validate-password-link',
  'admin/users/forgot-password',
  'admin/users/reset-password',
  'admin/users/whoami',
];

export const API_PUBLIC_ROUTES = ['api/users/login', 'api/users/whoami', 'api/categories', 'api/products'];

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const SESSION_COOKIE_NAME = `ecom.x-session-id`;
// export const SESSION_COOKIE_NAME = `${envConfig.NODE_ENV === 'local' ? '' : '__Secure-'}ecom.x-session-id`;
