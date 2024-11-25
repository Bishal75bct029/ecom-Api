import { Body, Controller, Param, Post } from '@nestjs/common';
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
        console.log(sub, 'sub is the');

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

    console.log(parentCategory, 'Parent category');

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
}
