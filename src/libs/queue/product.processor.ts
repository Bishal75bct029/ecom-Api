import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('productQueue')
export class ProductProcessor extends WorkerHost {
  async process(job: Job<any>): Promise<any> {
    console.log(`Processing job ${job.id} with data:`, job.data);

    // Your processing logic here
    const result = await this.performTask(job.data);

    console.log(`Job ${job.id} processed successfully:`, result);
    return result;
  }

  private async performTask(data: any): Promise<string> {
    // Simulate some task
    return `Processed data: ${JSON.stringify(data)}`;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} has been completed.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.error(`Job ${job.id} failed with error:`, err.message);
  }
}
