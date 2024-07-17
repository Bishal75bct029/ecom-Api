import { Module } from '@nestjs/common';
import { ReviewService } from './services/review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiReviewController, AdminReviewController } from './controllers';
import { ReviewEntity } from './entities/review.entity';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity]), UserModule, ProductModule],
  controllers: [ApiReviewController, AdminReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
