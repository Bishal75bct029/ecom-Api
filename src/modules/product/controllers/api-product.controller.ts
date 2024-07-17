import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { ProductService, ProductMetaService } from '../services';
import { CreateProductDto } from '../dto';
import { Request } from 'express';
import { RedisService } from '@/libs/redis/redis.service';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';

@Controller('api/products')
export class ApiProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productMetaService: ProductMetaService,
    private readonly redisService: RedisService,
    private readonly schoolDiscountService: SchoolDiscountService,
  ) {}

  @Get()
  async getProducts(@Req() { currentUser }: Request) {
    const { schoolId } = currentUser;

    const products = await this.productService.find({ relations: ['productMeta', 'categories'] });
    console.log(products);

    const schoolDiscountCache = (await this.redisService.get(`school_${schoolId}`)) as number;

    if (!schoolDiscountCache && schoolId) {
      const schoolDiscount = await this.schoolDiscountService.findOne({
        where: { schoolId },
        select: ['discountPercentage'],
      });

      if (!schoolDiscount) return products;
      await this.redisService.set(`school_${schoolId}`, schoolDiscount.discountPercentage);

      return this.productService.getDiscountedProducts(products, schoolDiscount.discountPercentage);
    }

    return this.productService.getDiscountedProducts(products, schoolDiscountCache);
  }
}
