import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  attributes: string[];

  @IsOptional()
  @IsObject()
  attributeOptions: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductMetaDto)
  productMetas: CreateProductMetaDto[];

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}

export class CreateProductMetaDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsArray()
  @IsOptional()
  image: string[];

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsObject()
  @IsOptional()
  variants: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isDefault: boolean;

  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
