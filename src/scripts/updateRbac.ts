import { Redis } from 'ioredis';
import { ManualCacheKeysEnum } from '../libs/redis/types';
import { envConfig } from '../configs/envConfig';

const url = 'http://0.0.0.0:4000/update';

(async () => {
  const redisClient = new Redis(envConfig.REDIS_URL);
  const key = crypto.randomUUID();
  await redisClient.set(ManualCacheKeysEnum.ECOM_UPDATE_KEY, key, 'EX', 60);
  const res = await fetch(`${url}?secret=${key}`, { method: 'GET' });
  console.log(await res.json());
  process.exit(0);
})();
