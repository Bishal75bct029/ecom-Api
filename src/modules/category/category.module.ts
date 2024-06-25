import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './services/category.service';
import { AdminCategoryController, ApiCategoryController } from './controllers';
import { CategoryEntity } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [AdminCategoryController, ApiCategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
