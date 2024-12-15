import { PaginationDto, ValidateIDDto } from '@/common/dtos';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export enum CategoryStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateUpdateCategoryDto extends PartialType(ValidateIDDto) {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested({ each: true })
  @Type(() => SubCategory)
  @IsNotEmpty()
  children: SubCategory[];

  @IsEnum(CategoryStatusEnum)
  status: CategoryStatusEnum;
}

export class SubCategory extends PartialType(ValidateIDDto) {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CategoryStatusEnum)
  @IsOptional()
  status: CategoryStatusEnum;

  @ValidateNested({ each: true })
  @Type(() => SubCategory)
  children: SubCategory[];
}

export class GetCategoryQuery extends PaginationDto {
  @IsOptional()
  sortBy?: 'name' | 'updatedAt' | 'productCount';

  @IsOptional()
  order?: 'ASC' | 'DESC';

  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  status?: 'active' | 'inactive';
}
