import { envConfig } from '@/configs/envConfig';

export const PRODUCT_SCHEDULAR_QUEUE = `${envConfig.REDIS_PREFIX}-product-schedular-queue`;
