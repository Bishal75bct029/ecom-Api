import { Controller, Get, Req } from '@nestjs/common';
import { ProductService } from '../services';
import { Request } from 'express';
import { RedisService } from '@/libs/redis/redis.service';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';

@Controller('api/products')
export class ApiProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly redisService: RedisService,
    private readonly schoolDiscountService: SchoolDiscountService,
  ) {}

  @Get()
  async getProducts(@Req() { currentUser }: Request) {
    const { schoolId } = currentUser;

    const products = await this.productService.find({ relations: ['productMeta', 'categories'] });

    const schoolDiscountCache = (await this.redisService.get(`school_${schoolId}`)) as number;

    if (!schoolDiscountCache) {
      const { discountPercentage } = await this.schoolDiscountService.findOne({
        where: { schoolId: schoolId },
        select: ['discountPercentage'],
      });
      if (!discountPercentage) return products;
      await this.redisService.set(`school_${schoolId}`, discountPercentage);

      return this.productService.getDiscountedProducts(products, discountPercentage);
    }

    return this.productService.getDiscountedProducts(products, schoolDiscountCache);
  }
}
