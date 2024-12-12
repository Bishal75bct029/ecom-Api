import { NextFunction, Request, Response } from 'express';
import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { getPatternMatchingRoute } from '@/common/utils';
import { PermissionService } from '@/modules/RBAC/services/permission.service';
import { UserRoleEnum } from '@/modules/user/entities';
import { envConfig } from '@/configs/envConfig';

@Injectable()
export class PermissionMiddleware implements NestMiddleware {
  constructor(private readonly permissionService: PermissionService) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const routesWithPermissions = await this.permissionService.find({
        where: {
          method: req.method,
          allowedRoles: req.originalUrl.includes('admin') ? UserRoleEnum.ADMIN : UserRoleEnum.USER,
        },
        cache: {
          id: `${envConfig.REDIS_PREFIX}:${req.method}-${req.originalUrl.includes('admin') ? UserRoleEnum.ADMIN : UserRoleEnum.USER}`,
          milliseconds: 86400 * 1000 * 5,
        },
      });
      const isRoutePresent = getPatternMatchingRoute(routesWithPermissions, req.originalUrl.split('?')[0], req.method);

      if (!isRoutePresent) throw new Error();
      next();
    } catch (error) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }
  }
}
