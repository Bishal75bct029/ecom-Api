import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ApiProductController } from './api-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductMetaEntity } from './entities/productMeta.entity';
import { AdminProductController } from './admin-product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductMetaEntity])],
  controllers: [ApiProductController, AdminProductController],
  providers: [ProductService],
})
export class ProductModule {}
