import { Controller, Get, Post, Body, Put, Param, BadRequestException, Query, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FindManyOptions, ILike, In } from 'typeorm';
import { ProductService, ProductMetaService } from '../services';
import { CreateProductDto, UpdateProductDto } from '../dto';
import { CategoryService } from '../../category/services/category.service';
import { getRecursiveDataArrayFromObjectOrArray } from '../helpers/getRecursiveDataArray.util';
import { getRoundedOffValue } from '@/common/utils';
import { GetAdminProductsQuery } from '../dto/get-products-filteredList-dto';
import { PRODUCT_STATUS_ENUM, ProductEntity } from '../entities';

@ApiTags('Admin Product')
@Controller('admin/products')
export class AdminProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productMetaService: ProductMetaService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async getAllProducts(@Query() productQuery: GetAdminProductsQuery) {
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
      order: sortBy ? { [sortBy]: order } : undefined,
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

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const { productMetas: requestProductMetas, categoryId, ...rest } = createProductDto;

    const category = await this.categoryService.findOne({ where: { id: categoryId } });
    if (!category) throw new BadRequestException("Doesn't exists this category.");
    if (!this.productService.validateVariant(createProductDto.attributeOptions, requestProductMetas))
      throw new BadRequestException('Invalid product variant');
    const treeCategory = await this.categoryService.findAncestorsTree(category);

    const categoryIds = this.categoryService.getIdsFromParent(treeCategory);
    const categories = await this.categoryService.find({ where: { id: In(categoryIds) } });

    const newProduct = this.productService.create({ ...rest, categories });
    const newProductMetas = this.productMetaService.createMany(requestProductMetas);

    const product = await this.productService.save({ ...newProduct });

    const productMetas = await this.productMetaService.saveMany(
      newProductMetas.map((meta) => ({ ...meta, product, price: meta.price * 100 })),
    );

    return { ...product, productMetas };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const { productMetas, categoryId, ...rest } = updateProductDto;

    const product = await this.productService.findOne({ where: { id } });

    if (!product) throw new BadRequestException('Product not found');

    const categories = await this.categoryService.find({ where: { id: In([...categoryId]) } });

    const ancestors = await Promise.all(categories.map((category) => this.categoryService.findAncestorsTree(category)));

    const categoryAncestoryList = getRecursiveDataArrayFromObjectOrArray({
      recursiveData: ancestors,
      recursiveObjectKey: 'parent',
      dataKey: 'name',
    });

    const tags = [...new Set([...categoryAncestoryList, ...product.tags])];
    const newProduct = this.productService.create({ id, ...rest, tags, categories });
    const updatedProduct = await this.productService.save(newProduct);
    const newProductMetas = this.productMetaService.createMany(productMetas);

    const updatedProductMetas = await this.productMetaService.saveMany(
      newProductMetas.map((meta) => ({ ...meta, price: Number(meta.price), product })),
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
