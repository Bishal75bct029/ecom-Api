import { Controller } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { Get } from '@nestjs/common';

@Controller('api/categories')
export class ApiCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async categories() {
    return this.categoryService.findTrees();
  }
}
