import { Controller, Get, Post, Body, Put, Param, BadRequestException, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ILike, In } from 'typeorm';
import { ProductService, ProductMetaService } from '../services';
import { CreateProductDto, UpdateProductDto } from '../dto';
import { CategoryService } from '../../category/services/category.service';
import { getRecursiveDataArrayFromObjectOrArray } from '../helpers/getRecursiveDataArray.util';
import { CategoryEntity } from '@/modules/category/entities/category.entity';

@ApiTags('Admin Product')
@Controller('admin/products')
export class AdminProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productMetaService: ProductMetaService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async getAllProducts(@Query('name') name?: string) {
    return this.productService.find({
      where: [{ name: ILike(`%${name}%`) }, { tags: ILike(`%${name}%`) }, { description: ILike(`%${name}%`) }],
      relations: ['productMeta', 'categories'],
    });
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const { productMetas: requestProductMetas, categoryIds, ...rest } = createProductDto;

    const newProduct = this.productService.create(rest);
    const newProductMetas = this.productMetaService.createMany(requestProductMetas);

    const categories = await this.categoryService.find({ where: { id: In(categoryIds) } });

    const ancestors = await Promise.all(categories.map((category) => this.categoryService.findAncestorsTree(category)));

    const categoryAncestoryList = getRecursiveDataArrayFromObjectOrArray({
      recursiveData: ancestors,
      recursiveObjectKey: 'parent',
      dataKey: 'name',
    });

    const tags = [...new Set([...categoryAncestoryList, ...newProduct.tags])];

    const product = await this.productService.save({ ...newProduct, tags });

    const productMetas = await this.productMetaService.saveMany(newProductMetas.map((meta) => ({ ...meta, product })));

    return { ...product, productMetas };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const { productMetas, categoryIds, ...rest } = updateProductDto;

    const product = await this.productService.findOne({ where: { id } });

    if (!product) throw new BadRequestException('Product not found');

    const categories = await this.categoryService.find({ where: { id: In(categoryIds) } });

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
      newProductMetas.map((meta) => ({ ...meta, product })),
    );

    return { ...updatedProduct, productMetas: updatedProductMetas };
  }
}
