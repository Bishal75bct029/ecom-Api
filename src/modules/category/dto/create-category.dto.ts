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
  image: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested({ each: true })
  @Type(() => SubCategory)
  @IsNotEmpty()
  subCategory: SubCategory[];

  @IsEnum(CategoryStatusEnum)
  status: CategoryStatusEnum;

  @IsString()
  @IsOptional()
  parent?: string;
}

export class SubCategory {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => SubCategory)
  children: SubCategory[];
}
