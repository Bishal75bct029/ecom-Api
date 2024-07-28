import { Controller, Get, NotFoundException, Param, Query, Req } from '@nestjs/common';
import { ProductService } from '../services';
import { Request } from 'express';
import { RedisService } from '@/libs/redis/redis.service';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';
import { In, IsNull, Not } from 'typeorm';
import { CategoryService } from '@/modules/category/services/category.service';
import { getAllTreeIds } from '../helpers/flattenTree.util';
import { SimilarProductsDto } from '../dto/similarProducts.dto';

@Controller('api/products')
export class ApiProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly redisService: RedisService,
    private readonly schoolDiscountService: SchoolDiscountService,
    private readonly categoryService: CategoryService,
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
          variant: {},
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

    const schoolDiscount = await this.schoolDiscountService.findOne({
      where: { schoolId },
      select: ['discountPercentage'],
      cache: true,
    });

    return schoolDiscount
      ? this.productService.getDiscountedProducts(products, schoolDiscount.discountPercentage)
      : this.productService.getDiscountedProducts(products);
  }

  @Get('category')
  async getProductsByCategory(@Req() { currentUser }: Request, @Query() dto: SimilarProductsDto) {
    if (!dto.categoryId) throw new NotFoundException('Products not found');
    const { schoolId } = currentUser;

    const existingCategory = await this.categoryService.findOne({ where: { id: dto.categoryId } });
    if (!existingCategory) throw new NotFoundException('Category not found');

    const categoryTrees = await this.categoryService.findDescendantsTree(existingCategory);
    const categoryIds = getAllTreeIds(categoryTrees);

    const products = await this.productService.find({
      relations: ['productMeta', 'categories'],
      where: {
        categories: { id: In(categoryIds) },
        productMeta: { isDefault: true },
        id: dto.productId ? Not(dto.productId) : Not(IsNull()),
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
          variant: {},
        },
      },
      take: 10,
    });

    if (!schoolId) return this.productService.getDiscountedProducts(products);

    const schoolDiscount = await this.schoolDiscountService.findOne({
      where: { schoolId },
      select: ['discountPercentage'],
      cache: true,
    });

    return schoolDiscount
      ? this.productService.getDiscountedProducts(products, schoolDiscount.discountPercentage)
      : this.productService.getDiscountedProducts(products);
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
          isDefault: true,
          stock: true,
          variant: {},
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

    const schoolDiscount = await this.schoolDiscountService.findOne({
      where: { schoolId },
      select: ['discountPercentage'],
      cache: true,
    });

    return schoolDiscount
      ? this.productService.getDiscountedProducts(product, schoolDiscount.discountPercentage)
      : this.productService.getDiscountedProducts(product);
  }
}
