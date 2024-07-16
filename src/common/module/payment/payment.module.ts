import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { StripeService } from './stripe.service';

@Module({
  exports: [PaypalService, StripeService],
  providers: [PaypalService, StripeService],
})
export class PaymentModule {}
