import { Controller, Post, Body, Get, Param, Delete, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CategoryService } from '../services/category.service';
import { CreateUpdateCategoryDto, GetCategoryQuery } from '../dto';
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
    const { id, name, description, status, children } = createCategoryDto;
    const { id: userId } = currentUser;

    const savedUpdatedCategory = await this.categoryService.createAndSave({
      id,
      name,
      description,
      status,
      children,
      updatedBy: { id: userId },
    });

    return savedUpdatedCategory;
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
