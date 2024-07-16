import { Module } from '@nestjs/common';
import { SQSService } from './sqs.service';
import { S3Service } from './s3.service';

@Module({
  providers: [SQSService, S3Service],
  exports: [SQSService, S3Service]
})
export class AWSModule {
}
