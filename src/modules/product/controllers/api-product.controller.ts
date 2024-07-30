import { Controller, Get, NotFoundException, Param, Query, Req } from '@nestjs/common';
import { ProductService } from '../services';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindManyOptions, ILike, In, IsNull, Not } from 'typeorm';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';
import { CategoryService } from '@/modules/category/services/category.service';
import { getAllTreeIds } from '../helpers/flattenTree.util';
import { GetProductsFilteredListDto } from '../dto/get-products-filteredList-dto';
import { ProductEntity } from '../entities';
import { getPaginatedResponse } from '@/common/utils';
import { SimilarProductsDto } from '../dto/similarProducts.dto';

@ApiTags('Api Product')
@ApiBearerAuth()
@Controller('api/products')
export class ApiProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly schoolDiscountService: SchoolDiscountService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get('')
  async getFilteredProducts(@Req() { currentUser }: Request, @Query() dto: GetProductsFilteredListDto) {
    const { schoolId } = currentUser;

    let { limit, page } = dto;
    limit = limit ? limit : 10;
    page = page ? page : 1;

    const whereQuery: FindManyOptions<ProductEntity>['where'] = { productMeta: { isDefault: true } };
    const sortQuery: FindManyOptions<ProductEntity>['order'] = {};

    if (dto.categoryId) {
      const existingCategory = await this.categoryService.findOne({ where: { id: dto.categoryId } });
      if (!existingCategory) throw new NotFoundException('Category not found');
      const categoryTrees = await this.categoryService.findDescendantsTree(existingCategory);
      const categoryIds = getAllTreeIds(categoryTrees);
      whereQuery['categories'] = { id: In(categoryIds) };
    }

    if (dto.search) {
      whereQuery['name'] = ILike(`%${dto.search}%`);
    }

    if (dto.sortBy) {
      switch (dto.sortBy) {
        case 'PHL':
          sortQuery['productMeta'] = { price: 'DESC' };
          break;
        case 'PLH':
          sortQuery['productMeta'] = { price: 'ASC' };
          break;
        case 'NA':
          sortQuery['productMeta'] = { createdAt: 'DESC' };
          break;
        default:
          break;
      }
    }

    const [products, count] = await this.productService.findAndCount({
      relations: ['productMeta', 'categories'],
      where: whereQuery,
      order: sortQuery,
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
    });

    if (!schoolId) {
      const discountedProducts = this.productService.getDiscountedProducts(products);
      return {
        items: discountedProducts,
        ...getPaginatedResponse({ count, limit, page }),
      };
    }

    const schoolDiscount = await this.schoolDiscountService.findOne({
      where: { schoolId },
      select: ['discountPercentage'],
      cache: true,
    });

    const discountedProducts = schoolDiscount
      ? this.productService.getDiscountedProducts(products, schoolDiscount.discountPercentage)
      : this.productService.getDiscountedProducts(products);

    return {
      items: discountedProducts,
      ...getPaginatedResponse({ count, limit, page }),
    };
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
