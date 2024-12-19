import { Global, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { V3, ConsumeOptions, ProduceOptions } from 'paseto';

@Injectable()
@Global()
export class PasetoJwtService extends JwtService {
  // Custom paseto sign method that internally encrypts to create a local token
  async pasetoSign(
    payload: Record<string, any>,
    { secret, ...options }: ProduceOptions & { secret?: string },
  ): ReturnType<typeof V3.sign> {
    return V3.encrypt(payload, secret, options);
  }

  // Custom paseto verify method that internally decrypts the local token
  async pasetoVerify<T>(
    token: string,
    { secret, ...options }: ConsumeOptions<false> & { secret?: string },
  ): Promise<T> {
    return V3.decrypt(token, secret, options);
  }
}
