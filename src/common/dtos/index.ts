import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class ValidateIDDto {
  @IsNotEmpty()
  @ApiProperty({ name: 'id' })
  @IsUUID('4', { message: 'Invalid ID: Please provide a valid UUID' })
  id: string;
}

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Ivalid limit: Please provide value greater than 0.' })
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Ivalid limit: Please provide value greater than 0.' })
  page?: number;
}
