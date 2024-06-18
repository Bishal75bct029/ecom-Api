import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from '@/modules/product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPEORM_CONFIG } from '@/configs/typeorm';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    ProductModule,
    TypeOrmModule.forRoot(TYPEORM_CONFIG),
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
