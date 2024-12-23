import { Controller, Get, NotFoundException, Param, Query, Req } from '@nestjs/common';
import { ProductService } from '../services';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { In, IsNull, Not } from 'typeorm';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';
import { ApiGetProductsDto } from '../dto/get-products-filteredList-dto';
import { SimilarProductsDto } from '../dto/similarProducts.dto';
import { CategoryService } from '@/modules/category/services/category.service';
// import { HttpsService } from '@/libs/https/https.service';
import { getAllTreeIds } from '../helpers';
import { getPaginatedResponse } from '@/common/utils';
import { ValidateIDDto } from '@/common/dtos';

@ApiTags('Api Product')
@ApiBearerAuth()
@Controller('api/products')
export class ApiProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly schoolDiscountService: SchoolDiscountService,
    private readonly categoryService: CategoryService,
    // private readonly httpsService: HttpsService,
  ) {}

  @Get('')
  async getProducts(@Req() req: Request, @Query() dto: ApiGetProductsDto) {
    const schoolId = req.session.user?.schoolId || undefined;

    let { limit, page } = dto;
    limit = limit ? limit : 10;
    page = page ? page : 1;

    const [products, count] = await this.productService.findAndCount({
      relations: ['productMeta', 'categories'],
      where: {
        productMeta: { isDefault: true },
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
          createdAt: true,
        },
        categories: {
          id: true,
          name: true,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      cache: 300,
    });

    const schoolDiscount = Number(
      schoolId
        ? (
            await this.schoolDiscountService.findOne({
              where: { schoolId },
              select: ['discountPercentage'],
              cache: true,
            })
          ).discountPercentage
        : 0,
    );

    return {
      products: this.productService.getDiscountedProducts(products, schoolDiscount),
      ...getPaginatedResponse({ count, limit, page }),
    };
  }

  @Get('category')
  async getProductsByCategory(@Req() { session: { user } }: Request, @Query() dto: SimilarProductsDto) {
    if (!dto.categoryId) throw new NotFoundException('Products not found');
    const { schoolId } = user;

    const existingCategory = await this.categoryService.findOne({
      where: { id: dto.categoryId },
    });
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
  async getProduct(@Param() { id }: ValidateIDDto, @Req() { session: { user } }: Request) {
    const { schoolId } = user;

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

  @Get('meta/:id')
  async getProductByMetaId(@Param() { id }: ValidateIDDto, @Req() { session: { user } }: Request) {
    const { schoolId } = user;

    const product = await this.productService.findOne({
      where: { productMeta: { id } },
      select: {
        id: true,
        name: true,
        description: true,
        productMeta: {
          image: true,
          price: true,
          id: true,
          stock: true,
          variant: {},
        },
      },
      relations: ['productMeta'],
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
