import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { DiscountService } from '../services/discount.service';
import { CreateDiscountDTO } from '../dto/create-discount.dto';
import { Request } from 'express';

@Controller('admin/discount')
export class AdminDiscountController {
  constructor(private discountServices: DiscountService) {}

  @Get()
  async show(@Req() req: Request) {
    console.log(req.currentUser);
    return await this.discountServices.find();
  }

  @Post()
  async create(@Body() discountDto: CreateDiscountDTO) {
    return this.discountServices.createAndSave(discountDto);
  }

  @Delete(':id')
  async delete(@Param() id: string) {
    return this.discountServices.softDelete(id);
  }
}
