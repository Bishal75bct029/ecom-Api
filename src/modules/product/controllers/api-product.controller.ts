import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ProductService } from '../services';
import { Request } from 'express';
import { RedisService } from '@/libs/redis/redis.service';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';
import { GetProductsByCategoryDto } from '../dto';
import { Not } from 'typeorm';
import { SimilarProductsDto } from '../dto/similar-products.dto';

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

    const products = await this.productService.find({
      relations: ['productMeta', 'categories'],
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        productMeta: {
          image: true,
          price: true,
          id: true,
        },
        categories: {
          id: true,
          name: true,
        },
      },
      where: {
        productMeta: {
          isDefault: true,
        },
      },
    });

    if (!schoolId) return this.productService.getDiscountedProducts(products);

    const schoolDiscountCache = (await this.redisService.get(`school_${schoolId}`)) as number | null;

    if (!schoolDiscountCache) {
      const schoolDiscount = await this.schoolDiscountService.findOne({
        where: { schoolId },
        select: ['discountPercentage'],
      });

      if (!schoolDiscount) return this.productService.getDiscountedProducts(products);
      await this.redisService.set(`school_${schoolId}`, schoolDiscount.discountPercentage);

      return this.productService.getDiscountedProducts(products, schoolDiscount.discountPercentage);
    }
  }

  @Get(':id')
  async getProduct(@Param('id') id: string, @Req() { currentUser }: Request) {
    const { schoolId } = currentUser;

    const product = await this.productService.findOne({
      relations: ['productMeta', 'categories'],
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        attributes: true,
        productMeta: {
          image: true,
          price: true,
          id: true,
          stock: true,
          variants: {},
          sku: true,
        },
        categories: {
          id: true,
          name: true,
        },
      },
      where: {
        id,
      },
    });

    if (!schoolId) return this.productService.getDiscountedProducts(product);

    const schoolDiscountCache = (await this.redisService.get(`school_${schoolId}`)) as number | null;

    if (!schoolDiscountCache) {
      const schoolDiscount = await this.schoolDiscountService.findOne({
        where: { schoolId },
        select: ['discountPercentage'],
      });

      if (!schoolDiscount) return this.productService.getDiscountedProducts(product);
      await this.redisService.set(`school_${schoolId}`, schoolDiscount.discountPercentage);

      return this.productService.getDiscountedProducts(product, schoolDiscount.discountPercentage);
    }
  }

  @Get()
  async getProductsByCategory(
    @Query() getProductByCategoryDto: GetProductsByCategoryDto,
    @Req() { currentUser }: Request,
  ) {
    const { schoolId } = currentUser;
    const products = await this.productService.find({
      relations: ['productMeta'],
      where: {
        id: Not(getProductByCategoryDto.productId),
      },
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        productMeta: {
          image: true,
          price: true,
          id: true,
        },
      },
      take: 10,
    });
  }

  @Get()
  async getSimilarProducts(@Query() similarProductsDto: SimilarProductsDto) {
    const { categoryId } = similarProductsDto;
    // this.get
  }
}
