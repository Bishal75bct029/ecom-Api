import { Controller, Post } from '@nestjs/common';
import { CategoryService } from '../services/category.service';

@Controller('api/categories')
export class ApiCategoryController {
  constructor(private readonly categoryService: CategoryService) {}
}
