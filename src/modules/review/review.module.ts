import { Module } from '@nestjs/common';
import { ReviewService } from './services/review.service';
import { ApiReviewController } from './controllers/api-review.controller';
import { AdminReviewController } from './controllers/admin-review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity])],
  controllers: [ApiReviewController, AdminReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
