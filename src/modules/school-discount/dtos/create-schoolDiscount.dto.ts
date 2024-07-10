import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max } from 'class-validator';

export class CreateSchoolDiscountDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  schoolId: string;

  @IsInt()
  @IsNotEmpty()
  @Max(100)
  discountPercentage: number;
}
