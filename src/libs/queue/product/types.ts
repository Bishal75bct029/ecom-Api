import { Job, Queue } from 'bullmq';

export type ProductQueueJobType = 'SCHEDULE'; //add new job type

interface ProductJobTypeMapping {
  SCHEDULE: ProductQueueJobData; //add new job
}

// add other properties if needed
export interface ProductQueueJobData {
  productId?: string;
}

export type ProductJob<T extends ProductQueueJobType = ProductQueueJobType> = Job<ProductJobTypeMapping[T], any, T>;
export type ProductQueue = Queue<ProductJob, string, ProductQueueJobType, ProductQueueJobData>;
