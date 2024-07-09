import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsNumber } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
export class UpdateProductStockDto {
  @IsArray()
  productMetaIds: string[];

  @IsNumber()
  stock: number;
}
