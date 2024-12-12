import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { PermissionEntity } from '@/modules/RBAC/entities';
import { InjectDataSource } from '@nestjs/typeorm';
import { RedisService } from './libs/redis/redis.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { envConfig } from './configs/envConfig';

@Controller()
@ApiExcludeController()
export class AppController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private redisService: RedisService,
  ) {}

  @Get('/health')
  health(): string {
    return 'Namaste';
  }

  @Get('/update')
  async update(@Query('secret') secret: string) {
    if (!secret) throw new UnauthorizedException('Unauthorized');

    const storedSecret = await this.redisService.get<string>(`${envConfig.REDIS_PREFIX}:ECOM_UPDATE_KEY`);

    if (!storedSecret || storedSecret !== secret) throw new UnauthorizedException('Unauthorized');

    const routes = JSON.parse(readFileSync('./dist/routes.json', 'utf8')) as PermissionEntity[];
    await Promise.all([
      this.dataSource
        .createQueryBuilder()
        .insert()
        .into(PermissionEntity)
        .values(routes)
        .orUpdate(['allowedRoles', 'path', 'method', 'feature'], ['path', 'method'])
        .execute(),
      this.dataSource.queryResultCache.remove(
        ['GET', 'POST', 'PUT', 'DELETE'].map((method) => `${envConfig.REDIS_PREFIX}:${method}-RBAC`),
      ),
      this.redisService.delete(`${envConfig.REDIS_PREFIX}:ECOM_UPDATE_KEY`),
    ]);
  }
}
