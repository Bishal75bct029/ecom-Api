import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProductController, ApiProductController } from './controllers';
import { ProductService, ProductMetaService } from './services';
import { CategoryModule } from '../category/category.module';
import { SchoolDiscountModule } from '../school-discount/school-discount.module';
import { HttpsModule } from '@/libs/https/https.module';
import { ProductEntity, ProductMetaEntity } from './entities';
import { RedisService } from '@/libs/redis/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, ProductMetaEntity]),
    CategoryModule,
    SchoolDiscountModule,
    HttpsModule,
  ],
  controllers: [ApiProductController, AdminProductController],
  providers: [ProductService, ProductMetaService, RedisService],
  exports: [ProductService, ProductMetaService],
})
export class ProductModule {}
