import { envConfig } from '@/configs/envConfig';
import {
  S3Client,
  PutObjectCommandInput,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { RequestPresigningArguments } from '@smithy/types';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY,
      },
      region: envConfig.AWS_REGION,
    });
  }

  async getPreSignedPutObjectUrl(putObjectInput: PutObjectCommandInput, options?: RequestPresigningArguments) {
    const putObjectCommand = new PutObjectCommand(putObjectInput);
    return getSignedUrl(this.s3Client, putObjectCommand, options);
  }

  public async getPresignedGetObjectUrl(getObjectInput: GetObjectCommandInput) {
    const command = new GetObjectCommand(getObjectInput);
    return getSignedUrl(this.s3Client, command);
  }

  public async removeObjectFromS3(deleteObjectInput: DeleteObjectCommandInput) {
    const command = new DeleteObjectCommand(deleteObjectInput);
    return this.s3Client.send(command);
  }
}
