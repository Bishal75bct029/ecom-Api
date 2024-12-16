import { PaginationDto } from '@/common/dtos';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export enum CategoryStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim())
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
  @Transform(({ value }) => value.trim())
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
  status?: 'active' | 'inactive';
}
