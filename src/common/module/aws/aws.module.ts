import { DynamicModule, Module } from '@nestjs/common';
import { SQSService } from './sqs.service';
import { SQSModuleAsyncOptions } from './aws.interface';
@Module({})
export class AWSModule {
  static forSQSRootAsync(sqsClientOptions: SQSModuleAsyncOptions): DynamicModule {
    return {
      module: AWSModule,
      providers: [
        {
          provide: 'SQS_CLIENT_OPTIONS',
          useFactory: sqsClientOptions.useFactory,
          inject: sqsClientOptions.inject,
        },
        SQSService,
      ],
      exports: [SQSService],
    };
  }

  // static forS3RootAsync(s3ClientOptions: S3ModuleAsyncOptions): DynamicModule {
  //   return {
  //     module: AWSModule,
  //     providers: [
  //       {
  //         provide: 'S3_CLIENT_OPTIONS',
  //         useFactory: s3ClientOptions.useFactory,
  //         inject: s3ClientOptions.inject,
  //       },
  //       SQSService,
  //     ],
  //     exports: [SQSService],
  //   };
  // }
}
