import { IsEnum, IsIn, IsNumber, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { PRODUCT_STATUS_ENUM } from '../entities';

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

export class GetAdminProductsQuery {
  @IsOptional()
  page: number;

  @IsOptional()
  limit: number;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(PRODUCT_STATUS_ENUM)
  @ValidateIf((o) => o.status !== 'all')
  status: PRODUCT_STATUS_ENUM | 'all';

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsIn(['name', 'productCount', 'updatedAt', 'stock'])
  sortBy: 'name' | 'productCount' | 'updatedAt' | 'stock';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'ASC' | 'DESC';
}

export type ProductInteractionType = 'view' | 'buy' | 'cart';
