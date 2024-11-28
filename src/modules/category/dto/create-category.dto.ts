import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export enum CategoryStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
export class CreateUpdateCategoryDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  image: string;

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

export class SubCategory {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => SubCategory)
  children: SubCategory[];
}

export class GetCategoryQuery {
  @IsOptional()
  sortBy: 'name' | 'updatedAt' | 'productCount';

  @IsOptional()
  order: 'ASC' | 'DESC';

  @IsOptional()
  @IsInt()
  limit: number;

  @IsOptional()
  @IsInt()
  page: number;

  @IsString()
  @IsOptional()
  search: string;

  @IsOptional()
  status: 'active' | 'inactive';
}
