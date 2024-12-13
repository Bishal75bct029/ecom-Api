import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AdminGetProductsDto {
  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsString()
  @IsOptional()
  name?: string;
}
