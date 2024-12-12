import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { SchoolDiscountService } from '../services/schoolDiscount.service';
import { CreateSchoolDiscountDto } from '../dtos/create-schoolDiscount.dto';
import { RedisService } from '@/libs/redis/redis.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin School Discount')
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

  @Delete(':schoolId')
  async delete(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    const deleteDB = this.schoolDiscountService.softDelete(schoolId);
    const deleteRedis = this.redisService.delete(`school_${schoolId}`);
    await Promise.all([deleteDB, deleteRedis]);
    return;
  }
}
