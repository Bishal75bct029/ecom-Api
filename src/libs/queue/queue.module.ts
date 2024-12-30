import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { envConfig } from '@/configs/envConfig';
import { ProductQueueService } from './product-queue.service';
import { ProductProcessor } from './product.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: envConfig.REDIS_HOST,
        port: envConfig.REDIS_PORT,
      },
      defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 5000,
        attempts: 3,
      },
    }),
    BullModule.registerQueue({
      name: 'productQueue', // Name of your queue
    }),
  ],
  providers: [ProductQueueService, ProductProcessor],
  exports: [ProductQueueService],
})
export class QueueModule {}
