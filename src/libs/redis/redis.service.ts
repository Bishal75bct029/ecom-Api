import { Inject, Injectable } from '@nestjs/common';
import { type Redis } from 'ioredis';
import { envConfig } from '@/configs/envConfig';
import { REDIS_CLIENT } from '@/app.constants';

@Injectable()
export class RedisService {
  private _prefix = envConfig.REDIS_PREFIX;
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  getClient() {
    return this.redisClient;
  }

  async get<T = string>(key: string): Promise<T | null> {
    const redisValue = await this.redisClient.get(`${this._prefix}:${key}`);
    try {
      return JSON.parse(redisValue) as T;
    } catch (error) {
      return redisValue as T;
    }
  }

  async set(key: string, value: any, expiry?: number): Promise<void> {
    value = JSON.stringify(value);

    if (!expiry) {
      await this.redisClient.set(`${this._prefix}:${key}`, value);
      return;
    }
    await this.redisClient.set(`${this._prefix}:${key}`, value, 'EX', expiry);
  }

  async delete(...keys: string[]): Promise<void> {
    await this.redisClient.del(keys.map((key) => `${this._prefix}:${key}`));
  }
}
