import { Controller, Post, Body, Get, Param, NotFoundException, Delete, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CategoryService } from '../services/category.service';
import { CategoryStatusEnum, CreateUpdateCategoryDto, GetCategoryQuery, SubCategory } from '../dto';
import { CategoryEntity } from '../entities/category.entity';
import { getPaginatedResponse } from '@/common/utils';
import { Request } from 'express';

@ApiTags('Admin Category')
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  async getAll(@Query() categoryQuery: GetCategoryQuery) {
    const { search, sortBy, status } = categoryQuery;
    let { order, limit, page } = categoryQuery;

    order = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    limit = limit || 10;
    page = page || 1;

    const queryBuilder = this.dataSource
      .getRepository(CategoryEntity)
      .createQueryBuilder('categories')
      .leftJoin('categories.products', 'product')
      .leftJoin('categories.updatedBy', 'users')
      .loadRelationCountAndMap('categories.productCount', 'categories.products')
      .select([
        'categories.id as id',
        'categories.name AS "name"',
        'categories.status as "status"',
        'users.name as "updatedBy"',
        'categories.updatedAt as "updatedAt"',
        'COUNT(product.id) AS "productCount"',
      ])
      .where('categories.parent IS NULL')
      .groupBy('categories.id')
      .addGroupBy('users.name');

    if (status) {
      queryBuilder.andWhere('categories.status = :status', { status: status.toUpperCase() });
    }
    if (search) {
      queryBuilder.andWhere('categories.name ILIKE :search', { search: `%${search}%` });
    }

    if (sortBy) {
      let orderByField: string;

      if (sortBy === 'productCount') {
        orderByField = `"${sortBy}"`;
      } else {
        orderByField = `categories.${sortBy}`;
      }

      queryBuilder.orderBy(orderByField, order);
    }

    const [categories, count] = await Promise.all([
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getRawMany(),
      queryBuilder.getCount(),
    ]);

    return {
      items: categories,
      ...getPaginatedResponse({ count, limit, page }),
    };
  }

  @Get(':id')
  async categoryByID(@Param('id') id: string) {
    const category = await this.categoryService.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });
    return this.categoryService.findDescendantsTree(category);
  }

  @Post()
  async saveCategory(@Req() { currentUser }: Request, @Body() createCategoryDto: CreateUpdateCategoryDto) {
    const { id, name, description, status, children, parent } = createCategoryDto;
    const { id: userId } = currentUser;

    const createSubCategories = async (
      subs: SubCategory[],
      parent: CategoryEntity | null,
      status: CategoryStatusEnum,
    ): Promise<CategoryEntity[]> => {
      const subCategories = [];

      for (const sub of subs) {
        const subEntity = this.categoryService.create({
          id: sub.id,
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
      id,
      name,
      description,
      status,
      parent: parentCategory,
      updatedBy: { id: userId },
    });

    const savedCategory = await this.categoryService.save(category);

    savedCategory.children = await createSubCategories(children, savedCategory, status);

    return await this.categoryService.save(savedCategory);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    const category = await this.categoryService.findOne({
      where: { id },
      select: {
        id: true,
      },
    });

    if (category) {
      const categoryWithChildren = await this.categoryService.findDescendantsTree(category);
      await this.categoryService.softRemove([categoryWithChildren]);
    }

    return true;
  }
}
