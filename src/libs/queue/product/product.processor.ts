import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { PRODUCT_SCHEDULAR_QUEUE } from '../constants';
import { ProductService } from '@/modules/product/services';
import { PRODUCT_STATUS_ENUM } from '@/modules/product/entities';
import { ProductScheduleJob } from './types';
import { RedisService } from '@/libs/redis/redis.service';

@Processor(PRODUCT_SCHEDULAR_QUEUE)
export class ProductProcessor extends WorkerHost {
  private readonly logger = new Logger(`${ProductProcessor.name}:${PRODUCT_SCHEDULAR_QUEUE}`);

  constructor(
    private readonly productService: ProductService,
    private readonly redisService: RedisService,
  ) {
    super();
  }
  async process(job: ProductScheduleJob): Promise<void> {
    this.logger.log(`Processing job ${job.id} with data: ${JSON.stringify(job.data)}`);

    const { data } = job;

    if (!data.productId) throw Error('Product Id is required.');
    const doesProductExist = await this.productService.findOne({ where: { id: data.productId } });
    if (!doesProductExist) throw Error(`Product with id ${data.productId} not found.`);
    await Promise.all([
      this.productService.update(
        { id: data.productId },
        { status: PRODUCT_STATUS_ENUM.PUBLISHED, scheduledDate: null },
      ),
      this.redisService.invalidateProducts(),
    ]);
    this.logger.log(`Job ${job.id} processed successfully: ${{ type: job.name, ...data }}`);
    return;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: ProductScheduleJob) {
    this.logger.log(`${job.name} Job ${job.id} completed: Product with id ${job.data.productId} has been published.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: ProductScheduleJob, err: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${err.message}`);
  }
}
