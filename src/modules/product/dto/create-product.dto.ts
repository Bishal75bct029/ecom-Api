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
  @ValidateNested({ each: true })
  @Type(() => CreateProductMetaDto)
  productMetas: CreateProductMetaDto[];

  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  categoryIds: string[];
}

export class CreateProductMetaDto {
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
  variants: object;

  @IsBoolean()
  @IsOptional()
  isDefault: boolean;
}
