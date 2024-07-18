import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SimilarProductsDto {
  @IsUUID()
  @IsOptional()
  productId: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
