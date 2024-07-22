import { Controller, Post, Body } from '@nestjs/common';
import { PaymentMethodService } from '../services/payment-method.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';

@Controller('admin/payment-methods')
export class AdminPaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  public async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodService.createAndSave(createPaymentMethodDto);
  }
}
