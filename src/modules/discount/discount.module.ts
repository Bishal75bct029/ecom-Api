import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountEntity } from './entity/discount.entity';
import { AdminDiscountController } from './controllers/admin-discount.controller';
import { DiscountService } from './services/discount.service';
import { ApiDiscountController } from './controllers/api-discount.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountEntity])],
  controllers: [AdminDiscountController, ApiDiscountController],
  providers: [DiscountService],
  exports: [DiscountService],
})
export class DiscountModule {}
