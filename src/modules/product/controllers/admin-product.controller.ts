import { Controller, Get, Post, Body, Put, Param, BadRequestException, Query, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { DataSource, FindManyOptions, ILike, In } from 'typeorm';
import { ProductService, ProductMetaService } from '../services';
import { CreateProductDto, UpdateProductDto } from '../dto';
import { CategoryService } from '../../category/services/category.service';
import { getRecursiveDataArrayFromObjectOrArray } from '../helpers';
import { getRoundedOffValue } from '@/common/utils';
import { ValidateIDDto } from '@/common/dtos';
import { GetAdminProductsQuery } from '../dto/get-products-filteredList-dto';
import { PRODUCT_STATUS_ENUM, ProductEntity, ProductMetaEntity } from '../entities';
import { envConfig } from '@/configs/envConfig';
import { UserEntity } from '@/modules/user/entities';

@ApiTags('Admin Product')
@Controller('admin/products')
export class AdminProductController {
  constructor(
    private dataSource: DataSource,
    private readonly productService: ProductService,
    private readonly productMetaService: ProductMetaService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async getAllProducts(@Query() productQuery: GetAdminProductsQuery, @Req() req: Request) {
    const { search, status, category, limit, page, sortBy } = productQuery;
    let { order } = productQuery;

    order = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let whereClause: FindManyOptions<ProductEntity>['where'] = [];

    if (search) {
      whereClause = [
        { name: ILike(`%${search}%`) },
        { tags: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) },
      ];
    }

    if (status && status.toLowerCase() !== 'all') {
      if (Array.isArray(whereClause) && whereClause.length > 0) {
        whereClause = whereClause.map((condition) => ({
          ...condition,
          status: status as PRODUCT_STATUS_ENUM,
        }));
      } else {
        whereClause = [{ status: status as PRODUCT_STATUS_ENUM }];
      }
    }

    if (category) {
      if (Array.isArray(whereClause) && whereClause.length > 0) {
        whereClause = whereClause.map((condition) => ({
          ...condition,
          categories: { name: category },
        }));
      } else {
        whereClause = [{ categories: { name: category } }];
      }
    }

    const categories = this.categoryService.find({ select: { name: true } });

    const [products, count] = await this.productService.findAndCount({
      where: whereClause,
      relations: ['productMeta', 'categories', 'updatedBy'],
      skip: (page - 1) * limit || 0,
      take: limit,
      cache: {
        id: `${envConfig.REDIS_PREFIX}:${req.url}`,
        milliseconds: 600000,
      },

      select: {
        id: true,
        name: true,
        status: true,
        images: true,
        productMeta: true,
        stock: true,
        categories: {
          name: true,
        },
        updatedAt: true,
        updatedBy: { name: true },
      },
      order: sortBy ? { [sortBy]: order } : { updatedAt: 'DESC' },
    });

    return {
      count,
      categories: (await categories).map((category) => category.name),
      items: products.map((product) => {
        return {
          ...product,
          updatedBy: product.updatedBy.name,
          categories: product.categories.map((category) => category.name),
          productMeta: product.productMeta.map((meta) => {
            return {
              ...meta,
              price: getRoundedOffValue(Number(meta.price) / 10000),
            };
          }),
        };
      }),
    };
  }

  @Get(':id')
  async getProductsById(@Param() { id }: ValidateIDDto) {
    const product = await this.productService.findOne({
      relations: ['productMeta', 'categories'],
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        images: true,
        scheduledDate: true,
        tags: true,
        attributes: true,
        productMeta: {
          images: true,
          price: true,
          id: true,
          isDefault: true,
          stock: true,
          attributes: {},
          sku: true,
        },
        categories: {
          id: true,
        },
      },
      where: {
        id,
      },
    });

    const { name, productMeta, categories, ...rest } = product;
    return { ...rest, title: name, variants: productMeta, categoryId: categories[0].id };
  }

  @Post()
  async create(@Req() { session: { user } }: Request, @Body() createProductDto: CreateProductDto) {
    const { title, variants: requestProductMetas, categoryId, ...rest } = createProductDto;
    if (createProductDto.status === PRODUCT_STATUS_ENUM.SCHEDULED && !createProductDto.scheduledDate) {
      throw new BadRequestException('Scheduled date is required');
    }

    const category = await this.categoryService.findOne({ where: { id: categoryId } });
    if (!category) throw new BadRequestException("Doesn't exists this category.");

    if (!this.productService.validateVariant(createProductDto.attributes, requestProductMetas))
      throw new BadRequestException('Invalid product variant');

    const treeCategory = await this.categoryService.findAncestorsTree(category);
    const categoryIds = this.categoryService.getIdsFromParent(treeCategory);
    const categories = await this.categoryService.find({ where: { id: In(categoryIds) } });

    let productMetas: ProductMetaEntity[];
    let product: ProductEntity;
    await this.dataSource.transaction(async (entityManager) => {
      const newProduct = this.productService.create({ ...rest, categories });
      const newProductMetas = this.productMetaService.createMany(requestProductMetas);

      const product = await entityManager.save(ProductEntity, {
        ...newProduct,
        name: title,
        stock: requestProductMetas.reduce((totalStock, meta) => totalStock + meta.stock, 0),
        updatedBy: { id: user.id },
        category: { id: categoryId },
      });

      productMetas = await entityManager.save(
        ProductMetaEntity,
        newProductMetas.map((meta, index) => ({ ...meta, product, price: meta.price * 100, isDefault: index === 0 })),
      );
    });

    return { ...product, productMetas };
  }

  @Put(':id')
  async update(
    @Param() { id }: ValidateIDDto,
    @Req() { session: { user } }: Request,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const { title, variants: requestProductMetas, categoryId, ...rest } = updateProductDto;
    if (updateProductDto.status === PRODUCT_STATUS_ENUM.SCHEDULED && !updateProductDto.scheduledDate) {
      throw new BadRequestException('Scheduled date is required');
    }

    if (!this.productService.validateVariant(updateProductDto.attributes, requestProductMetas))
      throw new BadRequestException('Invalid product variant');

    const product = await this.productService.findOne({ where: { id }, relations: ['productMeta'] });
    if (!product) throw new BadRequestException('Product not found');

    const existingMetas = product.productMeta;
    const requestMetaIds = requestProductMetas.map((meta) => meta.id);

    const metasToDelete = existingMetas.filter((meta) => !requestMetaIds.includes(meta.id));
    if (metasToDelete.length > 0) {
      await this.productMetaService.softRemove(metasToDelete);
    }

    const categories = await this.categoryService.find({ where: { id: categoryId } });
    const ancestors = await Promise.all(categories.map((category) => this.categoryService.findAncestorsTree(category)));
    const categoryAncestoryList = getRecursiveDataArrayFromObjectOrArray({
      recursiveData: ancestors,
      recursiveObjectKey: 'parent',
      dataKey: 'name',
    });

    const tags = [...new Set([...categoryAncestoryList, ...product.tags])];
    const newProduct = this.productService.create({ id, ...rest, tags, categories });
    const updatedProduct = await this.productService.save({
      ...newProduct,
      name: title,
      stock: requestProductMetas.reduce((totalStock, meta) => totalStock + meta.stock, 0),
      updatedBy: { id: user.id } as UserEntity,

      // category: { id: categoryId },
    });
    const newProductMetas = this.productMetaService.createMany(requestProductMetas);

    const updatedProductMetas = await this.productMetaService.save(
      newProductMetas.map((meta, index) => ({ ...meta, price: Number(meta.price), product, isDefault: index === 0 })),
    );

    return { ...updatedProduct, productMetas: updatedProductMetas };
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    const product = await this.productService.findOne({
      where: { id },
      relations: ['productMeta'],
      select: {
        id: true,
        productMeta: {
          id: true,
        },
      },
    });

    await this.productService.softRemove(product);

    return true;
  }
}
