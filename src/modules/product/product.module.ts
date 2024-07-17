import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity, ProductMetaEntity } from './entities';
import { AdminProductController, ApiProductController } from './controllers';
import { ProductService, ProductMetaService } from './services';
import { CategoryModule } from '../category/category.module';
import { SchoolDiscountModule } from '../school-discount/school-discount.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductMetaEntity]), CategoryModule, SchoolDiscountModule],
  controllers: [ApiProductController, AdminProductController],
  providers: [ProductService, ProductMetaService],
  exports: [ProductService, ProductMetaService],
})
export class ProductModule {}
