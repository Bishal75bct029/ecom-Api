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

  async get<T = string>(key: string, applyPrefix: boolean = true): Promise<T | null> {
    key = applyPrefix ? `${this._prefix}:${key}` : key;
    const redisValue = await this.redisClient.get(key);
    try {
      if (!applyPrefix) return redisValue as T;
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

  async findManyAndInvalidate(key: string) {
    const keys = await this.redisClient.keys(`${this._prefix}:${key}*`);
    if (keys.length === 0) return;
    return this.redisClient.del(keys);
  }

  async invalidateProducts() {
    return Promise.all([this.findManyAndInvalidate('/api/products'), this.findManyAndInvalidate('/admin/products')]);
  }

  async invalidateCategories() {
    return Promise.all([
      this.findManyAndInvalidate('/api/categories'),
      this.findManyAndInvalidate('/admin/categories'),
    ]);
  }
}
