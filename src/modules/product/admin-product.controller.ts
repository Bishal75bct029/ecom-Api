import { Controller, Get, Post, Body, Put, Param, BadRequestException, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductMetaService } from './product-meta.service';
import { CategoryService } from '../category/category.service';
import { ILike, In } from 'typeorm';
import { getRecursiveDataArray } from './helpers/getRecursiveDataArray.util';

@Controller('admin/products')
export class AdminProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productMetaService: ProductMetaService,
    private readonly categoryService: CategoryService,
  ) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const { productMetas: requestProductMetas, categoryIds, ...rest } = createProductDto;

    const newProduct = this.productService.create(rest);
    const newProductMetas = this.productMetaService.createMany(requestProductMetas);

    const categories = await this.categoryService.find({ where: { id: In(categoryIds) } });

    const ancestors = await Promise.all(categories.map((category) => this.categoryService.findAncestorsTree(category)));

    const { recursiveFunc, array: categoryAncestoryList } = getRecursiveDataArray('parent', 'name');
    ancestors.forEach((ancestor) => recursiveFunc(ancestor));

    const tags = [...new Set([...categoryAncestoryList, ...newProduct.tags])];

    const product = await this.productService.save({ ...newProduct, tags });

    const productMetas = await this.productMetaService.saveMany(newProductMetas.map((meta) => ({ ...meta, product })));

    return { ...product, productMetas };
  }

  @Get()
  async getAllProducts(@Query('name') name: string) {
    return this.productService.find({
      where: [{ name: ILike(`%${name}%`) }, { tags: ILike(`%${name}%`) }, { description: ILike(`%${name}%`) }],
      relations: ['productMeta', 'categories'],
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const { productMetas, categoryIds, ...rest } = updateProductDto;

    const product = await this.productService.findOne({ where: { id } });

    if (!product) throw new BadRequestException('Product not found');

    const categories = await this.categoryService.find({ where: { id: In(categoryIds) } });

    const ancestors = await Promise.all(categories.map((category) => this.categoryService.findAncestorsTree(category)));

    const { recursiveFunc, array: categoryAncestoryList } = getRecursiveDataArray('parent', 'name');
    ancestors.forEach((ancestor) => recursiveFunc(ancestor));

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
