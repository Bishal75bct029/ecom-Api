import { Controller, Post, Body, Get, Put, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentMethodService } from '../services/payment-method.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentIsActiveDto } from '../dto/update-payment-method.dto';

@ApiTags('Admin Payment Method')
@Controller('admin/payment-methods')
export class AdminPaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Get()
  get() {
    return this.paymentMethodService.find({ order: { createdAt: 'DESC' } });
  }

  @Post()
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodService.createAndSave(createPaymentMethodDto);
  }

  @Put()
  async update(@Body() paymentIsActive: UpdatePaymentIsActiveDto) {
    const { id } = paymentIsActive;
    if (!id) throw new BadRequestException('Invalid payment method');

    const paymentMethod = await this.paymentMethodService.findOne({ where: { id } });
    if (!paymentMethod) {
      throw new BadRequestException('Invalid payment method');
    }

    const activePaymentMethodCount = await this.paymentMethodService.count({ where: { isActive: true } });
    if (activePaymentMethodCount < 2) {
      throw new BadRequestException('Atleast one payment method need to be active');
    }

    await this.paymentMethodService.update({ id }, { ...paymentIsActive });
  }
}
