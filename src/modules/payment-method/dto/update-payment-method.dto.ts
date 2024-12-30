import { PartialType } from '@nestjs/swagger';
import { CreatePaymentMethodDto } from './create-payment-method.dto';
import { ValidateIDDto } from '@/common/dtos';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdatePaymentIsActiveDto extends ValidateIDDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {}
