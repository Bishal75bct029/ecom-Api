import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsUUID()
  @IsNotEmpty()
  productMetaId: string;

  @IsNumber()
  quantity: number;
}

export interface RemoveCartDto extends Pick<CreateCartDto, 'productMetaId'> {}
