import { Controller } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('API Category')
@ApiBearerAuth()
@Controller('api/categories')
export class ApiCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async categories() {
    return this.categoryService.findTrees({});
  }
}
