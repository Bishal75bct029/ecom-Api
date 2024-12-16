import { IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OmitType, PickType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { ValidateIDDto } from '@/common/dtos';

export class UpdateCategoryStatusDto extends PickType(CreateCategoryDto, ['status']) {}

class UpdateSubCategory extends ValidateIDDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateSubCategory)
  children: UpdateSubCategory[];
}

export class UpdateCategoryDto extends OmitType(CreateCategoryDto, ['children']) {
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid ID: Please provide a valid UUID' })
  id: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateSubCategory)
  @IsNotEmpty()
  children: UpdateSubCategory[];
}
