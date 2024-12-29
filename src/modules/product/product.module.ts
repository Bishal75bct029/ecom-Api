import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProductController, ApiProductController } from './controllers';
import { ProductService, ProductMetaService } from './services';
import { CategoryModule } from '../category/category.module';
import { SchoolDiscountModule } from '../school-discount/school-discount.module';
import { HttpsModule } from '@/libs/https/https.module';
import { ProductEntity, ProductMetaEntity } from './entities';
import { QueueModule } from '@/libs/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, ProductMetaEntity]),
    CategoryModule,
    SchoolDiscountModule,
    HttpsModule,
    forwardRef(() => QueueModule),
  ],
  controllers: [ApiProductController, AdminProductController],
  providers: [ProductService, ProductMetaService],
  exports: [ProductService, ProductMetaService],
})
export class ProductModule {}
