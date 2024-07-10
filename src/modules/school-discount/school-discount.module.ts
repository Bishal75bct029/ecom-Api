import { Module } from '@nestjs/common';
import { ApiSchoolDiscountController } from './controllers/api-schoolDiscount.controller';
import { AdminSchoolDiscountController } from './controllers/admin-schoolDiscount.controller';
import { SchoolDiscountService } from './services/schoolDiscount.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolDiscountEntity } from './entities/schoolDiscount.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolDiscountEntity])],
  controllers: [ApiSchoolDiscountController, AdminSchoolDiscountController],
  providers: [SchoolDiscountService],
  exports: [SchoolDiscountService],
})
export class SchoolDiscountModule {}
