import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ValidateIDDto } from '@/common/dtos';
import { PRODUCT_STATUS_ENUM } from '../entities';

export class Variant extends ValidateIDDto {
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    const val = value.replace(/\s+/g, ' ').trim();
    if (val.length > 50) throw new Error('Product name must be less than 50 characters.');
    return val;
  })
  title: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsNotEmpty()
  @IsArray()
  @Type(() => Attribute)
  @ValidateNested({ each: true })
  attributes: Attribute[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductMetaDto)
  variants: CreateProductMetaDto[];

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsEnum(PRODUCT_STATUS_ENUM)
  @IsOptional()
  status?: PRODUCT_STATUS_ENUM;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsDate()
  scheduledDate: Date;
}

export class Attribute extends ValidateIDDto {
  @IsString()
  @IsNotEmpty()
  attributeName: string;

  @IsArray()
  @Type(() => AttributeValue)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  attributeValues: AttributeValue[];
}

export class AttributeValue extends ValidateIDDto {
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class CreateProductMetaDto extends ValidateIDDto {
  // @IsString()
  // @IsNotEmpty()
  // sku: string;

  @IsArray()
  @IsOptional()
  images: string[];

  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Price must be greater than 0' })
  price: number;

  @IsObject()
  @IsNotEmpty()
  attributes: Record<string, string>;

  @IsBoolean()
  @IsOptional()
  isDefault: boolean;

  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Stock must be greater than 0' })
  stock: number;
}
