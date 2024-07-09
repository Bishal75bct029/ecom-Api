import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDiscountDTO {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  couponCode: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsBoolean()
  isPercentage: boolean;

  @IsNumber()
  minBuyingPrice: number;

  @IsInt()
  maxDiscountPrice: number;

  @IsDate()
  @IsNotEmpty()
  expiryTime: Date;
}

export class ApplyDiscountDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  productMetaId: string;
}
