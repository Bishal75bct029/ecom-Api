import { PaginationDto } from '@/common/dtos';
import { IsOptional, IsString } from 'class-validator';

export class GetUserListQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive';
}
