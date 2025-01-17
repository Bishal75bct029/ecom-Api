import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { PaginationDto } from '@/common/dtos';
import { OrderStatusEnum } from '../entities/order.entity';

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
  @IsEnum(OrderStatusEnum)
  @IsOptional()
  status: OrderStatusEnum;

  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsIn(['user', 'createdAt', 'id'])
  sortBy?: 'user' | 'createdAt' | 'id';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}

export class FilterOrderQuery {
  @IsOptional()
  @IsIn(['currentWeek', 'currentMonth', 'currentYear'], {
    message: 'filterTime must be one of "currentWeek", "currentMonth", or "currentYear"',
  })
  filterTime?: 'currentWeek' | 'currentMonth' | 'currentYear';
}
