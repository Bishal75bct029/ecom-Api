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
import { CategoryEntity } from '../entities/category.entity';
import { envConfig } from '@/configs/envConfig';
import { RedisService } from '@/libs/redis/redis.service';

@ApiTags('Admin Category')
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async getAll(@Query() categoryQuery: GetCategoryQuery, @Req() req: Request) {
    const { search, sortBy, status } = categoryQuery;
    let { order, limit, page } = categoryQuery;

    const isCacheable = !search && !status && !sortBy && !order;

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

    const categoriesQueryBuilder = queryBuilder
      .clone()
      .offset((page - 1) * limit || 0)
      .limit(limit);

    if (isCacheable) {
      categoriesQueryBuilder.cache(`${envConfig.REDIS_PREFIX}:${req.url}`, 86400 * 1000);
    }

    const countQueryBuilder = queryBuilder.clone();

    if (isCacheable) {
      countQueryBuilder.cache(`${envConfig.REDIS_PREFIX}:${req.url}-count`, 86400 * 1000);
    }

    const [categories, count] = await Promise.all([categoriesQueryBuilder.getRawMany(), countQueryBuilder.getCount()]);
    return {
      items: categories,
      ...getPaginatedResponse({ count, limit, page }),
    };
  }

  @Get('dropdown')
  async listCategoriesForDropdown(@Query() { depth, sortBy }: GetCategoryDropdownQuery) {
    const categories = await this.categoryService.findTrees(depth ? { depth: depth - 1 } : undefined);
    const properties: (keyof CategoryEntity)[] = ['id', 'name', 'createdAt', 'status'];

    const selectedSortBy =
      sortBy && properties.includes(sortBy as keyof CategoryEntity)
        ? (sortBy as keyof CategoryEntity)
        : ('name' as keyof CategoryEntity);

    return this.categoryService.pickPropertiesFromNestedTree(categories, properties, selectedSortBy);
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
      order: { createdAt: 'ASC' },
    });
    if (!category) throw new BadRequestException('Category not found');

    if (type === 'ancestors') {
      const ancestors = await this.categoryService.findAncestorsTree(category);

      return this.categoryService.sortTreeHierarchy(ancestors);
    }

    const descendants = await this.categoryService.findDescendantsTree(category);

    return this.categoryService.sortTreeHierarchy(descendants);
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

    children = this.categoryService.addPropertiesToNestedTree(children, { updatedBy: { id: user.id }, status });

    await Promise.all([
      this.categoryService.createAndSave(
        {
          name,
          description,
          status,
          children,
          updatedBy: { id: user.id },
        },
        { transaction: true },
      ),
      this.redisService.invalidateCategories(),
    ]);
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
    children = this.categoryService.addPropertiesToNestedTree(children, { updatedBy: { id: user.id }, status });
    await Promise.all([
      this.categoryService.createAndSave(
        {
          id,
          name,
          description,
          status,
          children,
          updatedBy: { id: user.id },
        },
        { transaction: true },
      ),
      this.redisService.invalidateCategories(),
    ]);
    return true;
  }

  @Put(':id')
  async toggleCategoryStatus(@Param() { id }: ValidateIDDto, @Body() { status }: UpdateCategoryStatusDto) {
    const category = await this.categoryService.findOne({ where: { id } });
    await this.categoryService.findDescendantsTree(category);
    const categoriesId = this.categoryService.getIdsFromParent(category);
    return Promise.all([
      this.categoryService.update({ id: In(categoriesId) }, { status }),
      this.redisService.invalidateCategories(),
    ]);
  }

  @Delete(':id')
  async deleteCategory(@Param() { id }: ValidateIDDto) {
    const category = await this.categoryService.findOne({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!category) throw new BadRequestException('Category not found.');

    const categoryWithChildren = await this.categoryService.findDescendantsTree(category);
    await Promise.all([
      this.categoryService.softRemove([categoryWithChildren]),
      this.redisService.invalidateCategories(),
    ]);
    return true;
  }
}
