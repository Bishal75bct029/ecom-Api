import {
  S3Client,
  GetObjectCommand,
  S3ClientConfig,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Manages interactions with an Amazon S3 bucket using pre-signed URLs.
 */
export class EcomS3Client {
  private s3Client: S3Client;
  private bucket: string;

  /**
   * Constructs a new MSTTvS3Client with the provided S3 client configuration and bucket name.
   * @param {S3ClientConfig} config - The configuration for the S3 client.
   * @param {string} bucket - The name of the S3 bucket.
   */
  constructor(config: S3ClientConfig, bucket: string) {
    this.s3Client = new S3Client(config);
    this.bucket = bucket;
  }

  /**
   * Generates a pre-signed URL for retrieving an object from the S3 bucket.
   * @param {Omit<GetObjectCommandInput, 'Bucket'>} getObjectInput - The input parameters for the GetObject command.
   * @returns {Promise<string>} A pre-signed URL for retrieving the object.
   */
  public async getPresignedGetObjectUrl(getObjectInput: Omit<GetObjectCommandInput, 'Bucket'>): Promise<string> {
    //expiresIn in seconds
    const command = new GetObjectCommand({ ...getObjectInput, Bucket: this.bucket });
    return getSignedUrl(this.s3Client, command);
  }

  /**
   * Generates a pre-signed URL for uploading an object to the S3 bucket.
   * @param {Omit<PutObjectCommandInput, 'Bucket'>} putObjectInput - The input parameters for the PutObject command.
   * @param {number} [expiresIn=300] - The expiration time for the pre-signed URL in seconds (default is 5 minutes).
   * @returns {Promise<string>} A pre-signed URL for uploading the object.
   */
  public async getPresignedPutObjectUrl(
    putObjectInput: Omit<PutObjectCommandInput, 'Bucket'>,
    expiresIn: number = 5 * 60,
  ): Promise<string> {
    const command = new PutObjectCommand({ ...putObjectInput, Bucket: this.bucket });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Removes an object from the S3 bucket.
   * @param {string} filePath - The path of the object to be removed.
   * @returns { Promise<DeleteObjectCommandOutput>} A Promise that resolves when the object is successfully removed.
   */
  public async removeObjectFromS3(filePath: string): Promise<DeleteObjectCommandOutput> {
    if (!filePath) return;

    const command = new DeleteObjectCommand({ Key: filePath, Bucket: this.bucket });
    return this.s3Client.send(command);
  }
}
