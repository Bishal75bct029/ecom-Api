import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions } from 'bullmq';
import { PRODUCT_QUEUE } from '../constants';
import { ProductQueue, ProductQueueJobData, ProductQueueJobType } from './types';

@Injectable()
export class ProductQueueService {
  constructor(@InjectQueue(PRODUCT_QUEUE) private readonly queue: ProductQueue) {}
  async addJob(name: ProductQueueJobType, data: ProductQueueJobData, opts?: JobsOptions) {
    await this.queue.add(name, data, opts);
  }
}
