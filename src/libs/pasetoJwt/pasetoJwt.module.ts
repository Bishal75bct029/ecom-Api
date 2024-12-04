import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasetoJwtService } from './pasetoJwt.service';

/* Module that provides paseto as well as normal jwt sign/verify service */
@Global()
@Module({
  imports: [JwtModule.register({ global: true })],
  providers: [PasetoJwtService],
  exports: [PasetoJwtService],
})
export class PasetoJwtModule {}
