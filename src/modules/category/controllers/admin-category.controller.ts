import { Controller, Post, Body, Get, Param, BadRequestException, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
import { CategoryRepository } from '../repositories/category.repository';

@ApiTags('Admin Category')
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    console.log(createCategoryDto);
    if (!createCategoryDto.parent) {
      return this.categoryRepository.saveCategory({ name: createCategoryDto.name, image: createCategoryDto.image });
    }

    const parentCategory = await this.categoryRepository.findOne({ where: { id: createCategoryDto.parent } });

    if (!parentCategory) throw new BadRequestException('Category parent not found');

    return this.categoryRepository.createAndSave({ name: createCategoryDto.name, parent: parentCategory });
  }

  @Get()
  async getAll() {
    return this.categoryRepository.findTrees();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const category = await this.categoryRepository.getCategory(id);

    return this.categoryRepository.findDescendantsTree(category);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) throw new BadRequestException('Category not found');

    await this.categoryRepository.createAndSave({ id, ...updateCategoryDto });

    return this.categoryRepository.findDescendantsTree(category);
  }
}
