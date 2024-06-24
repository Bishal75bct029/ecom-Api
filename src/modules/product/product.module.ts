import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiProductController } from './api-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductMetaEntity } from './entities/productMeta.entity';
import { AdminProductController } from './admin-product.controller';
import { ProductMetaService } from './product-meta.service';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductMetaEntity]), CategoryModule],
  controllers: [ApiProductController, AdminProductController],
  providers: [ProductService, ProductMetaService],
  exports: [ProductService, ProductMetaService],
})
export class ProductModule {}
