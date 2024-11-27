import { OmitType } from '@nestjs/mapped-types';
import { CreateUpdateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends OmitType(CreateUpdateCategoryDto, ['parent']) {}
