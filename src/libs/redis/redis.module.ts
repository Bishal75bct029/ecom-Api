import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';
import { envConfig } from '@/configs/envConfig';
import { REDIS_CLIENT } from '@/app.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const redisInstance = new Redis(`redis://${envConfig.REDIS_HOST}:${envConfig.REDIS_PORT}`);
        redisInstance.on('error', (e) => {
          throw new Error(`Redis connection failed: ${e}`);
        });
        return redisInstance;
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onApplicationShutdown(): Promise<void> {
    return new Promise((resolve) => {
      const redis = this.moduleRef.get<Redis>(REDIS_CLIENT);
      redis.quit();
      redis.on('end', resolve);
    });
  }
}
