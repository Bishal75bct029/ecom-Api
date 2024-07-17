import { IsNotEmpty, IsUUID } from 'class-validator';

export * from './create-product.dto';
export * from './update-product.dto';

export class GetProductsByCategoryDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsUUID()
  @IsNotEmpty()
  productId?: string;
}
