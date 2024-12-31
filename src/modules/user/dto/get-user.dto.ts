import { PaginationDto } from '@/common/dtos';
import { IsOptional, IsString } from 'class-validator';

export enum GET_USER_STATUS_ENUM {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class GetUserListQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  status?: GET_USER_STATUS_ENUM;
}
