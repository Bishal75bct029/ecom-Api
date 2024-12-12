import { NextFunction, Request, Response } from 'express';
import { ForbiddenException, Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { getPatternMatchingRoute } from '@/common/utils';
import { PermissionService } from '@/modules/RBAC/services/permission.service';
import { UserRoleEnum } from '@/modules/user/entities';
import { envConfig } from '@/configs/envConfig';

@Injectable()
export class PermissionMiddleware implements NestMiddleware {
  constructor(private readonly permissionService: PermissionService) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    const routesWithPermissions = await this.permissionService.find({
      where: {
        method: req.method,
      },
      cache: {
        id: `${envConfig.REDIS_PREFIX}:${req.method}-RBAC`,
        milliseconds: 86400 * 1000 * 5,
      },
    });
    const isRoutePresent = getPatternMatchingRoute(routesWithPermissions, req.originalUrl.split('?')[0], req.method);

    if (!isRoutePresent) throw new NotFoundException('Route not found.');

    if (!isRoutePresent.allowedRoles.includes(req.currentUser.role as UserRoleEnum))
      throw new ForbiddenException('You do not have permission to perform this action.');
    next();
  }
}
