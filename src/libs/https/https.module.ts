import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpsService } from './https.service';

@Module({
  imports: [HttpModule],
  providers: [HttpsService],
  exports: [HttpsService],
})
export class HttpsModule {}
