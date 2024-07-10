import {
  IsArray,
  IsBoolean,
  IsJSON,
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
  @IsOptional()
  @IsString({ each: true })
  attributes: string[];

  @IsArray()
  @IsOptional()
  variants: Array<{ [key: string]: string }>;

  @IsOptional()
  @IsObject()
  attributeOptions: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductMetaDto)
  productMetas: CreateProductMetaDto[];

  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  categoryIds: string[];
}

export class CreateProductMetaDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsOptional()
  image: string;

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
