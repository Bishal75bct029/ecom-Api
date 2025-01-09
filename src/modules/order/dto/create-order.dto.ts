import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { PaginationDto } from '@/common/dtos';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProductMetaDto)
  productMetaIds: CreateOrderProductMetaDto[];

  @IsUUID('4', { message: 'Invalid payment method' })
  paymentMethodId: string;
}

class CreateOrderProductMetaDto {
  @IsUUID('4', { message: 'Invalid product' })
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export enum OrderQueryEnum {
  ALL = 'all',
  PENDING = 'pending',
}

export class OrderQueryDto extends PaginationDto {
  @IsEnum(OrderQueryEnum)
  @IsOptional()
  status: OrderQueryEnum;
}
