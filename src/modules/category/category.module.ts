import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AdminCategoryController } from './admin-category.controller';
import { ApiCategoryController } from './api-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [AdminCategoryController, ApiCategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
