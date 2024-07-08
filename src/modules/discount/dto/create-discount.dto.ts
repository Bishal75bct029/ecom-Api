import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDiscountDTO {
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
