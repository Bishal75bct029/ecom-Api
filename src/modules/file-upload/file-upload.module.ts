import { Module } from '@nestjs/common';
import { AdminFileUploadController } from './controllers/file-upload.controller';

@Module({
  controllers: [AdminFileUploadController],
})
export class FileUploadModule {}
