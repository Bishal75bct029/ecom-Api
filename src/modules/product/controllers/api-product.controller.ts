import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Query, Req } from '@nestjs/common';
import { ProductService } from '../services';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Between, FindManyOptions, ILike, In, IsNull, Not } from 'typeorm';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';
import { getAllTreeIds } from '../helpers/flattenTree.util';
import {
  GetProductsFilteredListDto,
  ProductQueyTypeEnum,
  UserInteractionResponse,
} from '../dto/get-products-filteredList-dto';
import { SimilarProductsDto } from '../dto/similarProducts.dto';
import { CategoryService } from '@/modules/category/services/category.service';
import { HttpsService } from '@/libs/https/https.service';
import { ProductEntity } from '../entities';
import { envConfig } from '@/configs/envConfig';
import { shuffleArray } from '../helpers/shuffleArrays';
import { getPaginatedResponse } from '@/common/utils';

@ApiTags('Api Product')
@ApiBearerAuth()
@Controller('api/products')
export class ApiProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly schoolDiscountService: SchoolDiscountService,
    private readonly categoryService: CategoryService,
    private readonly httpsService: HttpsService,
  ) {}

  @Get('')
  async getFilteredProducts(@Req() { currentUser, headers }: Request, @Query() dto: GetProductsFilteredListDto) {
    const { schoolId } = currentUser;

    let { limit, page } = dto;
    limit = limit ? limit : 10;
    page = page ? page : 1;
    let products: ProductEntity[] = [];
    let count: number;

    if (dto.queryType === ProductQueyTypeEnum.RECOMMENDED && currentUser.id) {
      const { viewProductInteractions, buyCartProductInteractions, searchInteractions } =
        await this.httpsService.fetchData<UserInteractionResponse>(
          `${envConfig.USER_INTERACTION_BASE_URL}/api/interactions`,
          headers['authorization'].split(' ')[1],
        );

      const productInteractions = [...viewProductInteractions, ...buyCartProductInteractions];
      const clickedSearchedroductsIds = searchInteractions[0].clickedProductId;

      const clickedSearchedProduct = await this.productService.find({
        relations: ['productMeta', 'categories'],
        where: {
          productMeta: { isDefault: true },
          id: In(clickedSearchedroductsIds),
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

      if (productInteractions.length) {
        const categoryIds = shuffleArray(productInteractions)
          .slice(0, 5)
          .map((data) => data.categoryId);

        const productIds = buyCartProductInteractions.map((data) => data.productId);

        const categoriesWithParents = await this.categoryService.find({
          where: { id: In(categoryIds) },
          relations: ['parent'],
        });

        // Extract only the parent entities or return an empty array if no parent exists
        const parentCategories = categoriesWithParents.filter((category) => !!category.parent);

        const categoryTrees = await Promise.all(
          parentCategories.map(async (parentCategory) => {
            return await this.categoryService.findDescendantsTree(parentCategory);
          }),
        );

        const relatedCategoryIds = categoryTrees
          .map((categoryTree) => {
            return getAllTreeIds(categoryTree);
          })
          .flat(Infinity);

        const [recommendedProducts, recommendedCount] = await this.productService.findAndCount({
          relations: ['productMeta', 'categories'],
          where: {
            categories: { id: In(relatedCategoryIds) },
            productMeta: { isDefault: true },
            id: Not(In(productIds)),
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
        products = [...recommendedProducts, ...clickedSearchedProduct];
        count = recommendedCount + viewProductInteractions.length;
      }
    } else {
      const whereQuery: FindManyOptions<ProductEntity>['where'] = {
        productMeta: { isDefault: true },
      };
      const sortQuery: FindManyOptions<ProductEntity>['order'] = {};

      if (dto.categoryId) {
        const existingCategory = await this.categoryService.findOne({
          where: { id: dto.categoryId },
        });
        if (!existingCategory) throw new NotFoundException('Category not found');
        // const categoryTrees = await this.categoryService.findDescendantsTree(existingCategory);
        // const categoryIds = getAllTreeIds(categoryTrees);
        whereQuery['categories'] = { id: In([existingCategory.id]) };
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

      if (dto.maxPrice !== undefined && dto.minPrice !== undefined) {
        whereQuery['productMeta'] = {
          price: Between(dto.minPrice * 100, dto.maxPrice * 100),
        };
      }

      const [totalProducts, totalCount] = await this.productService.findAndCount({
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

      products = [...totalProducts];
      count = totalCount;
    }

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
  async getProduct(@Param('id', ParseUUIDPipe) id: string, @Req() { currentUser }: Request) {
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

  @Get('meta/:id')
  async getProductByMetaId(@Param('id', ParseUUIDPipe) id: string, @Req() { currentUser }: Request) {
    const { schoolId } = currentUser;

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
