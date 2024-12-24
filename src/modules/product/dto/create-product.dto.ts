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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
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
  title: string;

  @IsString()
  @IsOptional()
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
  @Type(() => Images)
  @ValidateNested({ each: true })
  images?: Images[];

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

export class Images extends ValidateIDDto {
  @IsString()
  @IsOptional()
  url: string;
}

export class CreateProductMetaDto extends ValidateIDDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Images)
  images: Images[];

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsObject()
  @IsOptional()
  attributes: Record<string, string>;

  @IsBoolean()
  @IsOptional()
  isDefault: boolean;

  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
