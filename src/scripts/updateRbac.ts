import { Redis } from 'ioredis';
import { CacheKeysEnum } from '../libs/redis/types';
import { envConfig } from '../configs/envConfig';

const url = 'http://0.0.0.0:4000/update';

(async () => {
  const redisClient = new Redis(`redis://${envConfig.REDIS_HOST}:${envConfig.REDIS_PORT}`);
  const key = crypto.randomUUID();
  await redisClient.set(CacheKeysEnum.ECOM_UPDATE_KEY, key, 'EX', 60);
  const res = await fetch(`${url}?secret=${key}`, { method: 'GET' });
  console.log(await res.json());
  process.exit(0);
})();
