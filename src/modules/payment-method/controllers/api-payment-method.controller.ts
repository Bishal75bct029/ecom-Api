import { Controller, Post, Body, Get } from '@nestjs/common';
import { PaymentMethodService } from '../services/payment-method.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';

@Controller('api/payment-methods')
export class ApiPaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  public async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodService.createAndSave(createPaymentMethodDto);
  }

  @Get()
  public async findAll() {
    return this.paymentMethodService.find({ where: { isActive: true } });
  }
}
