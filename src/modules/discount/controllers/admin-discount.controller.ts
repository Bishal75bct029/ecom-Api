import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { DiscountService } from '../services/discount.service';
import { CreateDiscountDTO } from '../dto/create-discount.dto';
import { ValidateIDDto } from '@/common/dtos';

@Controller('admin/discount')
export class AdminDiscountController {
  constructor(private discountServices: DiscountService) {}

  @Get()
  async show() {
    return await this.discountServices.find();
  }

  @Post()
  async create(@Body() discountDto: CreateDiscountDTO) {
    return this.discountServices.createAndSave(discountDto);
  }

  @Delete(':id')
  async delete(@Param() { id }: ValidateIDDto) {
    return this.discountServices.softDelete(id);
  }
}
