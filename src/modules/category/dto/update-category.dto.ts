import { IsEnum, IsNotEmpty } from 'class-validator';
import { CategoryStatusEnum } from './create-category.dto';

export class CategoryStatusDto {
  @IsEnum(CategoryStatusEnum)
  @IsNotEmpty()
  status: CategoryStatusEnum;
}
