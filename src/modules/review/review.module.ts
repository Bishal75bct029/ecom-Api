import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiReviewController } from './api-review.controller';
import { AdminReviewController } from './admin-review.controller';

@Module({
  controllers: [ApiReviewController, AdminReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
