import { Controller, Get, Inject, Query, UnauthorizedException } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { type Redis } from 'ioredis';
import { ApiExcludeController } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { PermissionEntity } from '@/modules/RBAC/entities';
import { ManualCacheKeysEnum } from './libs/redis/types';
import { REDIS_CLIENT } from './app.constants';
import { envConfig } from './configs/envConfig';

@Controller()
@ApiExcludeController()
export class AppController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  @Get('/health')
  health(): string {
    return 'Namaste';
  }

  @Get('/update')
  async update(@Query('secret') secret: string) {
    if (!secret) throw new UnauthorizedException('Unauthorized');

    const storedSecret = await this.redisClient.get(ManualCacheKeysEnum.ECOM_UPDATE_KEY);
    if (!storedSecret || storedSecret !== secret) throw new UnauthorizedException('Unauthorized');

    const routes = JSON.parse(readFileSync('./dist/routes.json', 'utf8')) as PermissionEntity[];
    await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .insert()
        .into(PermissionEntity)
        .values(routes)
        .orUpdate(['allowedRoles', 'path', 'method', 'feature', 'isSystemUpdate'], ['path', 'method'])
        .execute(),
      this.redisClient.del(ManualCacheKeysEnum.ECOM_UPDATE_KEY),
    ]);

    await Promise.all(
      ['GET', 'POST', 'PUT', 'DELETE'].map((method) =>
        this.redisClient.set(
          `${envConfig.REDIS_PREFIX}:${method}-RBAC`,
          JSON.stringify(routes.filter((route) => route.method === method)),
        ),
      ),
    );
    return { message: 'Updated' };
  }
}
