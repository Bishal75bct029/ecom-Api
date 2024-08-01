import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProductMetaDto)
  productMetaIds: CreateOrderProductMetaDto[];

  @IsString()
  paymentMethodId: string;
}

class CreateOrderProductMetaDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class OrderQueryDto {
  @IsString()
  status: OrderQueryEnum;
}

export enum OrderQueryEnum {
  ALL = 'all',
  PENDING = 'pending',
}
