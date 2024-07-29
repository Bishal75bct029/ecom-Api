import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ProductSortQueryEnum {
  PRICE_HIGH_TO_LOW = 'PHL',
  PRICE_LOW_TO_HIGH = 'PLH',
  NEWEST_ARRIVALS = 'NA',
}

export class GetProductsFilteredListDto {
  @IsUUID()
  @IsOptional()
  categoryId: string;

  @IsString()
  @IsOptional()
  search: string;

  @IsNumber()
  @IsOptional()
  limit: number;

  @IsNumber()
  @IsOptional()
  page: number;

  @IsEnum(ProductSortQueryEnum)
  @IsOptional()
  sortBy: ProductSortQueryEnum;
}
