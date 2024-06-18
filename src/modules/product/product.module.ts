import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductMetaEntity } from './entities/productMeta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductMetaEntity])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
