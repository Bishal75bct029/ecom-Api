import { Controller, Post, Body, Get, Param, Delete, Query, Req, Put, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { In } from 'typeorm';
import { Request } from 'express';

import { CategoryService } from '../services/category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoryQuery,
  UpdateCategoryStatusDto,
  GetCategoryTypeQuery,
  GetCategoryDropdownQuery,
} from '../dto';
import { getPaginatedResponse } from '@/common/utils';
import { ValidateIDDto } from '@/common/dtos';
import { addPropertiesToNestedTree, pickPropertiesFromNestedTree } from '../helpers';
import { type CategoryEntity } from '../entities/category.entity';

@ApiTags('Admin Category')
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAll(@Query() categoryQuery: GetCategoryQuery) {
    const { search, sortBy, status } = categoryQuery;
    let { order, limit, page } = categoryQuery;

    order = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    limit = limit || undefined;
    page = page || 1;

    const queryBuilder = this.categoryService
      .createQueryBuilder('categories')
      .leftJoin('categories.products', 'product')
      .innerJoin('categories.updatedBy', 'users')
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
    } else {
      queryBuilder.orderBy('categories.createdAt', 'DESC');
    }

    const [categories, count] = await Promise.all([
      queryBuilder
        .offset((page - 1) * limit || 0)
        .limit(limit)
        .getRawMany(),
      queryBuilder.getCount(),
    ]);

    return {
      items: categories,
      ...getPaginatedResponse({ count, limit, page }),
    };
  }

  @Get('dropdown')
  async listCategoriesForDropdown(@Query() { depth }: GetCategoryDropdownQuery) {
    const categories = await this.categoryService.findTrees(depth ? { depth: depth - 1 } : undefined);
    return pickPropertiesFromNestedTree(categories, ['id', 'name']);
  }

  @Get(':id')
  async categoryByID(@Param() { id }: ValidateIDDto, @Query() { type }: GetCategoryTypeQuery) {
    const category = await this.categoryService.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
      },
    });
    if (!category) throw new BadRequestException('Category not found');

    if (type === 'ancestors') {
      return this.categoryService.findAncestorsTree(category);
    }

    return this.categoryService.findDescendantsTree(category);
  }

  @Post()
  async saveCategory(@Req() { session: { user } }: Request, @Body() createCategoryDto: CreateCategoryDto) {
    const { name, description, status } = createCategoryDto;
    let { children } = createCategoryDto;

    const trees = await this.categoryService.findTrees({ depth: 1 });
    const isNameNotUnique = trees.some((tree) => tree.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (isNameNotUnique) {
      throw new BadRequestException('Parent category name must be unique.');
    }

    children = addPropertiesToNestedTree(children, { updatedBy: { id: user.id }, status });

    await this.categoryService.createAndSave(
      {
        name,
        description,
        status,
        children,
        updatedBy: { id: user.id },
      },
      { transaction: true },
    );
    return true;
  }

  @Put()
  async updateCategory(@Req() { session: { user } }: Request, @Body() updateCategoryDto: UpdateCategoryDto) {
    const { id, name, description, status } = updateCategoryDto;
    let { children } = updateCategoryDto;

    const categoryExists = await this.categoryService.findOne({ where: { id }, select: { id: true } });

    if (!categoryExists) {
      throw new BadRequestException("Category doesn't exist.");
    }

    // check uniqueness
    const trees = await this.categoryService.findTrees({ depth: 1 });
    const isNameNotUnique = trees
      .filter((tree) => tree.id !== id)
      .some((tree) => tree.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (isNameNotUnique) {
      throw new BadRequestException('Parent category name must be unique.');
    }

    // delete children if not in request
    const treeData = await this.categoryService.findDescendantsTree(categoryExists);
    const requestChildrenIds = this.categoryService.getIdsFromParent(updateCategoryDto as CategoryEntity);
    const dbChildrenIds = this.categoryService.getIdsFromParent(treeData);
    const idsToDelete = dbChildrenIds.filter((id) => !requestChildrenIds.includes(id));
    if (idsToDelete.length) {
      await this.categoryService.softDelete({ id: In(idsToDelete) });
    }

    // update
    children = addPropertiesToNestedTree(children, { updatedBy: { id: user.id }, status });
    await this.categoryService.createAndSave(
      {
        id,
        name,
        description,
        status,
        children,
        updatedBy: { id: user.id },
      },
      { transaction: true },
    );
    return true;
  }

  @Put(':id')
  async toggleCategoryStatus(@Param() { id }: ValidateIDDto, @Body() { status }: UpdateCategoryStatusDto) {
    const category = await this.categoryService.findOne({ where: { id } });
    await this.categoryService.findDescendantsTree(category);
    const categoriesId = this.categoryService.getIdsFromParent(category);
    return this.categoryService.update({ id: In(categoriesId) }, { status });
  }

  @Delete(':id')
  async deleteCategory(@Param() { id }: ValidateIDDto) {
    const category = await this.categoryService.findOne({
      where: { id },
      select: {
        id: true,
      },
    });

    if (category) {
      const categoryWithChildren = await this.categoryService.findDescendantsTree(category);
      await this.categoryService.softRemove([categoryWithChildren]);
      return true;
    }

    throw new BadRequestException('Category not found');
  }
}
