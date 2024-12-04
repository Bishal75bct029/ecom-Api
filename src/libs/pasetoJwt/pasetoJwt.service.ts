import { Global, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { V4, ConsumeOptions, ProduceOptions } from 'paseto';

@Injectable()
@Global()
export class PasetoJwtService extends JwtService {
  // Custom paseto sign method
  async pasetoSign(
    payload: Record<string, any>,
    { secret, ...options }: ProduceOptions & { secret?: string },
  ): ReturnType<typeof V4.sign> {
    return V4.sign(payload, Buffer.from(secret, 'hex'), options);
  }

  // Custom paseto verify method
  async pasetoVerify<T>(
    token: string,
    { secret, ...options }: ConsumeOptions<false> & { secret?: string },
  ): Promise<T> {
    return V4.verify(token, Buffer.from(secret, 'hex'), options);
  }
}
