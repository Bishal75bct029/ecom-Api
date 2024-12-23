import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { ApiExcludeController } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { PermissionEntity } from '@/modules/RBAC/entities';
import { CacheKeysEnum } from './libs/redis/types';
import { RedisService } from './libs/redis/redis.service';

@Controller()
@ApiExcludeController()
export class AppController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  @Get('/health')
  health(): string {
    return 'Namaste';
  }

  @Get('/update')
  async update(@Query('secret') secret: string) {
    if (!secret) throw new UnauthorizedException('Unauthorized');

    const storedSecret = await this.redisService.get(CacheKeysEnum.ECOM_UPDATE_KEY, false);
    if (!storedSecret || storedSecret !== secret) throw new UnauthorizedException('Unauthorized');

    const routes = JSON.parse(readFileSync('./dist/routes.json', 'utf8')) as PermissionEntity[];
    await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .insert()
        .into(PermissionEntity)
        .values(routes)
        .orUpdate(['path', 'method', 'feature', 'isSystemUpdate'], ['path', 'method'], {
          skipUpdateIfNoValuesChanged: true,
        })
        .execute(),
      this.redisService.delete(CacheKeysEnum.ECOM_UPDATE_KEY),
    ]);

    await Promise.all(
      ['GET', 'POST', 'PUT', 'DELETE'].map((method) =>
        this.redisService.set(
          `${method}-RBAC`,
          routes.filter((route) => route.method === method),
        ),
      ),
    );
    return { message: 'Updated' };
  }
}
