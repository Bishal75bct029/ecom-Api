import { Body, Controller, Delete, NotFoundException, Param, Post } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto, SubCategory } from '../dto';
import { CategoryEntity } from '../entities/category.entity';

@ApiTags('API Category')
@ApiBearerAuth()
@Controller('api/categories')
export class ApiCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async categories() {
    return this.categoryService.findTrees({});
  }

  @Get(':id')
  async categoryByID(@Param('id') id: string) {
    return this.categoryService.findOne({ where: { id }, relations: ['children'] });
  }

  @Post()
  async saveCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const { name, description, status, subCategory, parent } = createCategoryDto;

    const createSubCategories = async (
      subs: SubCategory[],
      parent: CategoryEntity | null,
      status: 'ACTIVE' | 'INACTIVE',
    ): Promise<CategoryEntity[]> => {
      const subCategories = [];

      for (const sub of subs) {
        const subEntity = this.categoryService.create({
          name: sub.name,
          status,
          parent,
        });

        const savedSubEntity = await this.categoryService.save(subEntity);
        savedSubEntity.children =
          sub.children && sub.children.length > 0
            ? await createSubCategories(sub.children, savedSubEntity, status)
            : [];

        await this.categoryService.save(savedSubEntity);
        subCategories.push(savedSubEntity);
      }

      return subCategories;
    };

    const parentCategory = parent ? await this.categoryService.findOne({ where: { id: parent } }) : null;

    const category = this.categoryService.create({
      name,
      description,
      status,
      parent: parentCategory,
    });

    const savedCategory = await this.categoryService.save(category);

    savedCategory.children = await createSubCategories(subCategory, savedCategory, status);

    return await this.categoryService.save(savedCategory);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    const category = await this.categoryService.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) throw new NotFoundException('Category not found');

    const deleteChildNodes = (category: CategoryEntity) => {
      for (const child of category.children) {
        if (child.children && child.children.length > 0) {
          deleteChildNodes(child);
        }
        this.categoryService.softDelete(child.id);
      }
    };

    deleteChildNodes(category);

    await this.categoryService.softDelete(id);
  }
}
