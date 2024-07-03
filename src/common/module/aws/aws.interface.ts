import { S3ClientConfig } from '@aws-sdk/client-s3';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { SQSClientConfig } from '@aws-sdk/client-sqs';

export interface S3ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<S3ClientConfig> | S3ClientConfig;
  inject?: any[];
}

export interface SQSModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<SQSClientConfig> | SQSClientConfig;
  inject?: any[];
}
