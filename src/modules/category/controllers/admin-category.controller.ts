import { Controller, Post, Body, Get, Param, BadRequestException, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';

@ApiTags('Admin Category')
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    if (!createCategoryDto.parent) {
      return this.categoryService.createAndSave({ name: createCategoryDto.name });
    }

    const parentCategory = await this.categoryService.findOne({ where: { id: createCategoryDto.parent } });

    if (!parentCategory) throw new BadRequestException('Category parent not found');

    return this.categoryService.createAndSave({ name: createCategoryDto.name, parent: parentCategory });
  }

  @Get()
  async getAll() {
    return this.categoryService.findTrees();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const category = await this.categoryService.findOne({ where: { id } });

    return this.categoryService.findDescendantsTree(category);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryService.findOne({ where: { id } });

    if (!category) throw new BadRequestException('Category not found');

    await this.categoryService.update({ id }, updateCategoryDto);

    return this.categoryService.findDescendantsTree(category);
  }
}
