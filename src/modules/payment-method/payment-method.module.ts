import { Module } from '@nestjs/common';
import { PaymentMethodService } from './services/payment-method.service';
import { ApiPaymentMethodController } from './controllers/api-payment-method.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodEntity } from './entities/payment-method.entity';
import { AdminPaymentMethodController } from './controllers/admin-payment-method.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethodEntity])],
  controllers: [ApiPaymentMethodController, AdminPaymentMethodController],
  providers: [PaymentMethodService],
})
export class PaymentMethodModule {}
