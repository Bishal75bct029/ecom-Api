import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobType, JobsOptions } from 'bullmq';
import { PRODUCT_SCHEDULAR_QUEUE } from '../constants';
import { ProductQueueJobData, ProductScheduleJob, ProductScheduleQueue } from './types';

@Injectable()
export class ProductScheduleQueueService {
  constructor(@InjectQueue(PRODUCT_SCHEDULAR_QUEUE) private readonly scheduleQueue: ProductScheduleQueue) {}
  async addJob(data: ProductQueueJobData, opts?: JobsOptions) {
    await this.scheduleQueue.add('SCHEDULE', data, opts);
  }

  async removeJob(jobId: string) {
    await this.scheduleQueue.remove(jobId);
  }

  async findJobs(types: JobType[], start?: number, end?: number, asc?: boolean): Promise<ProductScheduleJob[]> {
    return this.scheduleQueue.getJobs(types, start, end, asc);
  }
}
