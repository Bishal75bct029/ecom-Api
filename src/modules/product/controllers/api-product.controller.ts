import { Controller, Post, Body, Get } from '@nestjs/common';
import { ProductService, ProductMetaService } from '../services';
import { CreateProductDto } from '../dto';

@Controller('api/products')
export class ApiProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productMetaService: ProductMetaService,
  ) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  get() {
    return 'api';
  }
}
