import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AdminCategoryController } from './admin-category.controller';
import { ApiCategoryController } from './api-category.controller';

@Module({
  controllers: [AdminCategoryController, ApiCategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
