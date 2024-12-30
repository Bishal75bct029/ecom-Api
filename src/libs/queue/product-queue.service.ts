import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';

@Injectable()
export class ProductQueueService {
  constructor(@InjectQueue('productQueue') private readonly queue: Queue) {}
  async addJob(name: string, data: object, opts?: JobsOptions) {
    await this.queue.add(name, data, opts);
  }
}
