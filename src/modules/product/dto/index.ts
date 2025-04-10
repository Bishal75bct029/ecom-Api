import { IsNotEmpty, IsUUID } from 'class-validator';

export * from './create-product.dto';
export * from './update-product.dto';
export * from './get-products.dto';
export class GetProductsByCategoryDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsUUID()
  @IsNotEmpty()
  productId?: string;
}
