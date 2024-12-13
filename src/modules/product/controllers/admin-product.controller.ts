import { Controller, Get, Post, Body, Put, Param, BadRequestException, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ILike, In } from 'typeorm';
import { ProductService, ProductMetaService } from '../services';
import { AdminGetProductsDto, CreateProductDto, UpdateProductDto } from '../dto';
import { CategoryService } from '../../category/services/category.service';
import { getRecursiveDataArrayFromObjectOrArray } from '../helpers/getRecursiveDataArray.util';
import { getPaginatedResponse, getRoundedOffValue } from '@/common/utils';

@ApiTags('Admin Product')
@Controller('admin/products')
export class AdminProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productMetaService: ProductMetaService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async getAllProducts(@Query() query: AdminGetProductsDto) {
    const { name } = query;
    let { limit, page } = query;

    limit = limit || 10;
    page = page || 1;

    const [products, count] = await this.productService.findAndCount({
      where: {
        name: name ? ILike(`%${name}%`) : undefined,
      },
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        productMeta: {
          id: true,
          price: true,
          sku: true,
          isDefault: true,
          image: true,
          stock: true,
        },
      },
      relations: ['productMeta', 'categories'],
      skip: (page - 1) * limit,
      take: limit,
      cache: 300,
    });

    return {
      products: products.map((product) => ({
        ...product,
        meta: product.productMeta.map((meta) => ({ ...meta, price: getRoundedOffValue(Number(meta.price) / 10000) })),
      })),
      ...getPaginatedResponse({ count, limit, page }),
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

    const productMetas = await this.productMetaService.save(
      newProductMetas.map((meta) => ({ ...meta, product, price: meta.price * 100 })),
    );

    return { ...product, productMetas };
  }

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
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

    const updatedProductMetas = await this.productMetaService.save(
      newProductMetas.map((meta) => ({ ...meta, price: Number(meta.price), product })),
    );

    return { ...updatedProduct, productMetas: updatedProductMetas };
  }
}
