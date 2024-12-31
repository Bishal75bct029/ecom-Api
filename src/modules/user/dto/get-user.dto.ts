import { PaginationDto, STATUS_ENUM } from '@/common/dtos';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetUserListQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsEnum(STATUS_ENUM)
  status?: STATUS_ENUM;
}
