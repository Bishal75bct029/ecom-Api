import { Controller } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('api/categories')
export class ApiCategoryController {
  constructor(private readonly categoryService: CategoryService) {}
}
