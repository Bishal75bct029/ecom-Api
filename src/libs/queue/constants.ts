import { envConfig } from '@/configs/envConfig';

export const PRODUCT_QUEUE = `${envConfig.REDIS_PREFIX}-product-queue`;
