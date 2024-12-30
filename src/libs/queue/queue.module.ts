import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { envConfig } from '@/configs/envConfig';
import { ProductScheduleQueueService } from './product/product-queue.service';
import { ProductProcessor } from './product/product.processor';
import { PRODUCT_SCHEDULAR_QUEUE } from './constants';
import { ProductModule } from '@/modules';

@Module({
  imports: [
    BullModule.forRoot({
      // do not set prefix here. Error will be thrown.
      connection: {
        host: envConfig.REDIS_HOST,
        port: envConfig.REDIS_PORT,
        enableReadyCheck: true, // Ensure Redis connection is ready
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }, // Exponential delay for retries
      },
    }),
    BullModule.registerQueue({
      name: PRODUCT_SCHEDULAR_QUEUE, // Name of your queue
    }),
    forwardRef(() => ProductModule),
  ],
  providers: [ProductScheduleQueueService, ProductProcessor],
  exports: [ProductScheduleQueueService],
})
export class QueueModule {}
