import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { CreateOrderDto } from './create-order.dto';
import { OrderItemStatusEnum } from '../entities/order-history.entity';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsUUID('4', { message: 'Invalid order-item id' })
  orderItemId: string;

  @IsNotEmpty()
  @IsEnum(OrderItemStatusEnum)
  status: OrderItemStatusEnum;
}
