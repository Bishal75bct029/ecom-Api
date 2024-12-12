import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentMethodService } from '../services/payment-method.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';

@ApiTags('Admin Payment Method')
@Controller('admin/payment-methods')
export class AdminPaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  public async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodService.createAndSave(createPaymentMethodDto);
  }
}
