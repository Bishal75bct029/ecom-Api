import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GetUserListQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
