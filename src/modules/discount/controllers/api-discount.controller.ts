import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DiscountService } from '../services/discount.service';
import { MoreThan } from 'typeorm';

@Controller('api/discount')
export class ApiDiscountController {
  constructor(private discountService: DiscountService) {}

  @Get(':couponCode')
  async show(@Param() params: { couponCode: string }) {
    return await this.discountService.findOne({
      where: { couponCode: params.couponCode, expiryTime: MoreThan(new Date(new Date().toISOString())) },
    });
  }
}
