import { UserRoleEnum } from '@/modules/user/entities';
import { Reflector } from '@nestjs/core';
import { writeFileSync } from 'fs';
import { type PermissionEntity } from '@/modules/RBAC/entities';
import { ROUTE_FEATURE_NAME } from '../decorators/route-feature-name.decorator';

const requestMethodToActionMapper = {
  GET: 'READ',
  POST: 'CREATE',
  DELETE: 'DELETE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
};

const routesToFeatureMappers = {
  categories: 'CATEGORY',
  products: 'PRODUCT',
  carts: 'CART',
  payments: 'PAYMENT',
  permissions: 'PERMISSION',
  users: 'USER',
  orders: 'ORDER',
  review: 'REVIEW',
  'payment-methods': 'PAYMENT_METHOD',
  'school-discount': 'SCHOOL_DISCOUNT',
};

export const transformAllRoutes = (server: any) => {
  const router = server._events.request._router;
  const reflector = new Reflector();

  const routes = router.stack
    .map((layer: any) => {
      if (layer.route) {
        const route = layer.route;
        const path = route?.path;
        const method = route.stack[0].method.toUpperCase();
        if (
          (path.startsWith('/admin') || path.startsWith('/api')) &&
          ['GET', 'POST', 'PUT', 'PATCH', 'DELETE '].includes(method)
        ) {
          const transformedRoute = {
            feature: (() => {
              const nameProvided = reflector.get(ROUTE_FEATURE_NAME, route.stack[0]?.handle);
              if (nameProvided) return nameProvided;
              const featureName = route.path.startsWith('/admin') ? 'ADMIN-' : 'USER-';
              const routeBasedFeature = `-${routesToFeatureMappers[route.path.slice(1).split('/')[1]]}`;
              return featureName + requestMethodToActionMapper[method] + routeBasedFeature;
            })(),
            method,
            path,
            allowedRoles: (() => {
              if (route.path.startsWith('/admin')) {
                return [UserRoleEnum.ADMIN];
              }
              if (route.path.startsWith('/api')) {
                return [UserRoleEnum.USER];
              }
              return [];
            })(),
          } as PermissionEntity;
          return transformedRoute;
        }
        return false;
      }
      return false;
    })
    .filter(Boolean);
  writeFileSync('./dist/routes.json', JSON.stringify(routes));
};
