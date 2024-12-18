import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ProductSortQueryEnum {
  PRICE_HIGH_TO_LOW = 'PHL',
  PRICE_LOW_TO_HIGH = 'PLH',
  NEWEST_ARRIVALS = 'NA',
}

export enum ProductQueyTypeEnum {
  RECOMMENDED = 'recommended',
}

export class ApiGetProductsDto {
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

  @IsNumber()
  @IsOptional()
  minPrice: number;

  @IsNumber()
  @IsOptional()
  maxPrice: number;

  @IsEnum(ProductQueyTypeEnum)
  @IsOptional()
  queryType: ProductQueyTypeEnum;
}

export class UserInteractionResponse {
  viewProductInteractions: ProductInteractionResponse[];
  buyCartProductInteractions: ProductInteractionResponse[];
  searchInteractions: SearchInteractionResponse[];
}

export class ProductInteractionResponse {
  _id: string;
  categoryId: string;
  productId: string;
  userId: string;
  type: ProductInteractionType;
}

export class SearchInteractionResponse {
  _id: string;
  filterApplied: { minPrice: string; maxPrice: string };
  clickedProductId: string[];
  sortBy: string;
  value: string;
  userId: string;
}

export type ProductInteractionType = 'view' | 'buy' | 'cart';
