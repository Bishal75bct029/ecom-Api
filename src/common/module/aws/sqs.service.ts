import { Inject, Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand, SendMessageRequest, SQSClientConfig } from '@aws-sdk/client-sqs';

@Injectable()
export class SQSService {
  private readonly sqsClient: SQSClient;

  constructor(@Inject('SQS_CLIENT_OPTIONS') sqsClientOptions: SQSClientConfig) {
    this.sqsClient = new SQSClient(sqsClientOptions);
  }

  async sendToQueue(messageRequest: SendMessageRequest) {
    return this.sqsClient.send(
      new SendMessageCommand({
        MessageBody: messageRequest.MessageBody,
        QueueUrl: messageRequest.QueueUrl,
      }),
    );
  }
}
