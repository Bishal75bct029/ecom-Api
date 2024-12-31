import { PaginationDto } from '@/common/dtos';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export enum CategoryStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    const val = value.replace(/\s+/g, ' ').trim();
    if (val.length > 100) throw new Error('Category name must be less than 100 characters.');
    return val;
  })
  name: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.replace(/\s+/g, ' ').trim())
  description?: string;

  @IsEnum(CategoryStatusEnum)
  status: CategoryStatusEnum;

  @ValidateNested({ each: true })
  @Type(() => SubCategory)
  @IsNotEmpty()
  children: SubCategory[];
}

class SubCategory {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.replace(/\s+/g, ' ').trim())
  name: string;

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
  @IsEnum(CategoryStatusEnum)
  status?: CategoryStatusEnum;
}

export class GetCategoryTypeQuery {
  @IsString()
  @IsOptional()
  type: 'ancestors';
}

export class GetCategoryDropdownQuery {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  depth?: number;
}
