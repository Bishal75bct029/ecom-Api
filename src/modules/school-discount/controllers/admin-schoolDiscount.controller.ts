import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { SchoolDiscountService } from '../services/schoolDiscount.service';
import { CreateSchoolDiscountDto } from '../dtos/create-schoolDiscount.dto';
import { RedisService } from '@/libs/redis/redis.service';

@Controller('admin/school-discount')
export class AdminSchoolDiscountController {
  constructor(
    private readonly schoolDiscountService: SchoolDiscountService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async getSchoolDiscounts() {
    return this.schoolDiscountService.find();
  }

  @Post()
  async create(@Body() createSchoolDiscount: CreateSchoolDiscountDto) {
    let schoolDiscount = await this.schoolDiscountService.findOne({
      where: { schoolId: createSchoolDiscount.schoolId },
    });

    if (schoolDiscount) {
      schoolDiscount = await this.schoolDiscountService.createAndSave({
        id: schoolDiscount.id,
        ...createSchoolDiscount,
      });
    } else {
      schoolDiscount = await this.schoolDiscountService.createAndSave(createSchoolDiscount);
    }

    this.redisService.set(`school_${schoolDiscount.schoolId}`, createSchoolDiscount.discountPercentage);

    return schoolDiscount;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.schoolDiscountService.softDelete(id);
  }
}
