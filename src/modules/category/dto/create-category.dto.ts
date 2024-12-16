import { PaginationDto } from '@/common/dtos';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export enum CategoryStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
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
