import { Job, Queue } from 'bullmq';

// add other properties if needed
export interface ProductQueueJobData {
  productId?: string;
  scheduledDate?: Date;
}
export type ProductScheduleJob<T extends string = string> = Job<ProductQueueJobData, any, T>;
export type ProductScheduleQueue = Queue<ProductScheduleJob<'SCHEDULE'>, string, 'SCHEDULE', ProductQueueJobData>;
