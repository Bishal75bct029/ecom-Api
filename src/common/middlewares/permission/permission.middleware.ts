import { NextFunction, Request, Response } from 'express';
import { ForbiddenException, Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { getPatternMatchingRoute } from '@/common/utils';
import { PermissionService } from '@/modules/RBAC/services/permission.service';
import { RedisService } from '@/libs/redis/redis.service';
import { type PermissionEntity } from '@/modules/RBAC/entities';

@Injectable()
export class PermissionMiddleware implements NestMiddleware {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly redisService: RedisService,
  ) {}
  async use(req: Request, _res: Response, next: NextFunction) {
    const isCached = await this.redisService.get<PermissionEntity[]>(`${req.method}-RBAC`);

    let routesWithPermissions: PermissionEntity[] = [];
    if (!isCached || !isCached.length) {
      routesWithPermissions = await this.permissionService.find({
        where: {
          method: req.method,
        },
      });
      await this.redisService.set(`${req.method}-RBAC`, routesWithPermissions);
    } else {
      routesWithPermissions = isCached;
    }

    const isRoutePresent = getPatternMatchingRoute(routesWithPermissions, req.originalUrl.split('?')[0], req.method);

    if (!isRoutePresent) throw new NotFoundException('Route not found.');

    if (!isRoutePresent.allowedRoles.includes(req.session.user.role))
      throw new ForbiddenException('You do not have permission to perform this action.');
    next();
  }
}
