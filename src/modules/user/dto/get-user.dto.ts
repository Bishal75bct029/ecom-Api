import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GetUserListQueryDto {
  @IsString()
  @IsOptional()
  search: string;

  @IsBoolean()
  @IsOptional()
  status: boolean;

  @IsOptional()
  page: number;

  @IsOptional()
  limit: number;
}
