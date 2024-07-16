import { Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand, SendMessageRequest } from '@aws-sdk/client-sqs';
import { envConfig } from '@/configs/envConfig';

@Injectable()
export class SQSService {
  private readonly sqsClient: SQSClient;

  constructor() {
    this.sqsClient = new SQSClient({
      credentials: {
        accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY
      }
    })
  }

  public async sendToQueue(messageRequest: SendMessageRequest) {
    return this.sqsClient.send(
      new SendMessageCommand({
        MessageBody: messageRequest.MessageBody,
        QueueUrl: messageRequest.QueueUrl,
      }),
    );
  }
}
