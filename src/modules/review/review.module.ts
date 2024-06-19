import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiReviewController } from './api-review.controller';
import { AdminReviewController } from './admin-review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity])],
  controllers: [ApiReviewController, AdminReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
