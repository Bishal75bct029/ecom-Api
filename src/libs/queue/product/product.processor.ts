import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { PRODUCT_QUEUE } from '../constants';
import { ProductService } from '@/modules/product/services';
import { PRODUCT_STATUS_ENUM } from '@/modules/product/entities';
import { Logger } from '@nestjs/common';
import { ProductJob } from './types';

@Processor(PRODUCT_QUEUE)
export class ProductProcessor extends WorkerHost {
  private readonly logger = new Logger(`${ProductProcessor.name}:${PRODUCT_QUEUE}`);

  constructor(private readonly productService: ProductService) {
    super();
  }
  async process(job: ProductJob): Promise<string> {
    this.logger.log(`Processing job ${job.id} with data: ${JSON.stringify(job.data)}`);

    // Your processing logic here
    const result = await this.performTask(job);

    this.logger.log(`Job ${job.id} processed successfully: ${result}`);
    return result;
  }

  private async performTask(job: ProductJob): Promise<string> {
    const { data } = job;

    switch (job.name) {
      case 'SCHEDULE':
        if (!data.productId) throw Error('Product Id is required.');
        const doesProductExist = await this.productService.findOne({ where: { id: data.productId } });
        if (!doesProductExist) throw Error(`Product with id ${data.productId} not found.`);
        await this.productService.update({ id: data.productId }, { status: PRODUCT_STATUS_ENUM.PUBLISHED });
        return JSON.stringify({ productId: data.productId, type: job.name });
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: ProductJob) {
    switch (job.name) {
      case 'SCHEDULE':
        this.logger.log(
          `${job.name} Job ${job.id} completed: Product with id ${job.data.productId} has been published.`,
        );
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: ProductJob, err: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${err.message}`);
  }
}
