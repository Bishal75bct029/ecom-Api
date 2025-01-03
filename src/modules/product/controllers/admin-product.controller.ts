import { Controller, Get, Post, Body, Put, Param, BadRequestException, Query, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { DataSource, FindManyOptions, ILike, In } from 'typeorm';

import { ProductService, ProductMetaService } from '../services';
import { CreateProductDto, UpdateProductDto } from '../dto';
import { CategoryService } from '../../category/services/category.service';
import { getRoundedOffValue } from '@/common/utils';
import { ValidateIDDto } from '@/common/dtos';
import { GetAdminProductsQuery } from '../dto/get-products-filteredList-dto';
import { PRODUCT_STATUS_ENUM, ProductEntity, ProductMetaEntity } from '../entities';
import { UserEntity } from '@/modules/user/entities';
import { ProductScheduleQueueService } from '@/libs/queue/product/product-queue.service';
import { envConfig } from '@/configs/envConfig';
import { RedisService } from '@/libs/redis/redis.service';

@ApiTags('Admin Product')
@Controller('admin/products')
export class AdminProductController {
  constructor(
    private dataSource: DataSource,
    private readonly productService: ProductService,
    private readonly productMetaService: ProductMetaService,
    private readonly categoryService: CategoryService,
    private readonly productScheduleQueueService: ProductScheduleQueueService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async listProducts(@Query() productQuery: GetAdminProductsQuery, @Req() req: Request) {
    const { search, status, category, limit, page, sortBy } = productQuery;
    let { order } = productQuery;

    order = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let whereClause: FindManyOptions<ProductEntity>['where'] = [];

    if (search) {
      whereClause = [
        { name: ILike(`%${search}%`) },
        { tags: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) },
      ];
    }

    if (status && status.toLowerCase() !== 'all') {
      if (Array.isArray(whereClause) && whereClause.length > 0) {
        whereClause = whereClause.map((condition) => ({
          ...condition,
          status: status as PRODUCT_STATUS_ENUM,
        }));
      } else {
        whereClause = [{ status: status as PRODUCT_STATUS_ENUM }];
      }
    }

    if (category) {
      if (Array.isArray(whereClause) && whereClause.length > 0) {
        whereClause = whereClause.map((condition) => ({
          ...condition,
          categories: { name: category },
        }));
      } else {
        whereClause = [{ categories: { id: category } }];
      }
    }

    const [products, count] = await this.productService.findAndCount({
      where: whereClause,
      relations: ['productMeta', 'updatedBy'],
      skip: (page - 1) * limit || 0,
      take: limit,
      select: {
        id: true,
        name: true,
        status: true,
        scheduledDate: true,
        images: true,
        productMeta: true,
        stock: true,
        updatedAt: true,
        updatedBy: { name: true, id: true },
      },
      order: sortBy ? { [sortBy]: order } : { updatedAt: 'DESC' },
      cache:
        status || category || search || sortBy
          ? undefined
          : {
              id: `${envConfig.REDIS_PREFIX}:${req.url}`,
              milliseconds: 1000 * 60 * 60,
            },
    });

    return {
      count,
      items: products.map((product) => {
        return {
          ...product,
          updatedBy: product.updatedBy?.name ?? null,
          updatedAt: product.updatedBy?.name ? product.updatedAt : null,
          productMeta: product.productMeta.map((meta) => {
            return {
              ...meta,
              price: getRoundedOffValue(Number(meta.price) / 10000),
            };
          }),
        };
      }),
    };
  }

  @Get(':id')
  async getProduct(@Param() { id }: ValidateIDDto) {
    const product = await this.productService.findOne({
      relations: ['productMeta', 'categories', 'categories.children', 'categories.parent'],
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        images: true,
        scheduledDate: true,
        tags: true,
        attributes: true,
        productMeta: {
          images: true,
          price: true,
          id: true,
          isDefault: true,
          stock: true,
          attributes: {},
          sku: true,
        },
        categories: {
          id: true,
          parent: { id: true, children: true },
          children: { id: true, children: true },
        },
      },
      where: {
        id,
      },
    });

    const { name, productMeta, categories, ...rest } = product;
    const categoryId = this.categoryService.findLastCategory(categories);

    return {
      ...rest,
      title: name,
      variants: productMeta.map((meta) => ({ ...meta, price: getRoundedOffValue(Number(meta.price) / 10000) })),
      categoryId,
    };
  }

  @Post()
  async createProduct(@Req() { session: { user } }: Request, @Body() createProductDto: CreateProductDto) {
    const { title, variants: requestProductMetas, categoryId, scheduledDate, status, ...rest } = createProductDto;
    if (createProductDto.status === PRODUCT_STATUS_ENUM.SCHEDULED && !createProductDto.scheduledDate) {
      throw new BadRequestException('Scheduled date is required');
    }

    const category = await this.categoryService.findOne({ where: { id: categoryId } });
    if (!category) throw new BadRequestException("This category doesn't exist.");

    if (!this.productService.validateVariant(createProductDto.attributes, requestProductMetas))
      throw new BadRequestException('Invalid product variant.');

    const treeCategory = await this.categoryService.findAncestorsTree(category);
    const categoryIds = this.categoryService.getIdsFromParent(treeCategory);

    let product: ProductEntity;
    await this.dataSource.transaction(async (entityManager) => {
      const newProduct = this.productService.create({ ...rest, categories: categoryIds.map((id) => ({ id })) });

      product = await entityManager.save(ProductEntity, {
        ...newProduct,
        name: title,
        stock: requestProductMetas.reduce((totalStock, meta) => totalStock + meta.stock, 0),
        updatedBy: { id: user.id },
        category: { id: categoryId },
        status,
        scheduledDate,
      });

      await entityManager.insert(
        ProductMetaEntity,
        requestProductMetas.map((meta, index) => ({
          ...meta,
          product,
          sku: Date.now().toLocaleString(),
          price: meta.price * 100,
          isDefault: index === 0,
        })),
      );
    });

    // if product is scheduled
    if (status === PRODUCT_STATUS_ENUM.SCHEDULED) {
      await this.productScheduleQueueService.addJob(
        { productId: product.id, scheduledDate },
        { delay: new Date(scheduledDate).getTime() - Date.now(), jobId: product.id },
      );
    }

    await this.redisService.invalidateProducts();

    return true;
  }

  @Put(':id')
  async updateProduct(
    @Param() { id }: ValidateIDDto,
    @Req() { session: { user } }: Request,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const { title, variants: requestProductMetas, categoryId, scheduledDate, ...rest } = updateProductDto;
    if (updateProductDto.status === PRODUCT_STATUS_ENUM.SCHEDULED && !updateProductDto.scheduledDate) {
      throw new BadRequestException('Scheduled date is required.');
    }

    if (!this.productService.validateVariant(updateProductDto.attributes, requestProductMetas))
      throw new BadRequestException('Invalid product variant.');

    const product = await this.productService.findOne({ where: { id }, relations: ['productMeta'] });
    if (!product) throw new BadRequestException('Product not found.');

    if (product.status === PRODUCT_STATUS_ENUM.PUBLISHED)
      throw new BadRequestException('Published product cannot be updated.');

    const newMetaIds = await this.productService.findNewMetaIdsForProduct(product.productMeta, requestProductMetas);
    if (await this.productMetaService.findOne({ where: { id: In(newMetaIds) }, select: ['id'] })) {
      throw new BadRequestException('Variant doesnot exist in current product.');
    }

    const isValidStatusChange = this.productService.validateStatusChange(product.status, updateProductDto.status);
    if (!isValidStatusChange)
      throw new BadRequestException(
        `Product status cannot be changed from ${product.status} to ${updateProductDto.status}.`,
      );

    const category = await this.categoryService.findOne({ where: { id: categoryId } });
    if (!category) throw new BadRequestException("This category doesn't exist.");

    // transaction
    await this.dataSource.transaction(async (entityManager) => {
      // updating categories
      const treeCategory = await this.categoryService.findAncestorsTree(category);
      const categoryIds = this.categoryService.getIdsFromParent(treeCategory);
      const newProduct = this.productService.create({
        id,
        ...rest,
        categories: categoryIds.map((id) => ({ id })),
        name: title,
        stock: requestProductMetas.reduce((totalStock, meta) => totalStock + meta.stock, 0),
        updatedBy: { id: user.id } as UserEntity,
        scheduledDate,
      });

      // updating metas and deleting old metas
      const requestMetaIds = requestProductMetas.map((meta) => meta.id);
      const productMetaIds = product.productMeta.map((meta) => meta.id);
      const newMetaIds = requestMetaIds.filter((id) => !productMetaIds.includes(id));
      const productMetasToDelete = product.productMeta.filter((meta) => !requestMetaIds.includes(meta.id));

      const newProductMetas = this.productMetaService.createMany(
        requestProductMetas.map((meta, index) => {
          const newMeta = {
            ...meta,
            product: { id },
            price: Number(meta.price) * 100,
            isDefault: index === 0,
          };

          if (newMetaIds.includes(meta.id)) {
            return {
              ...newMeta,
              sku: Date.now().toLocaleString(),
            };
          }

          return newMeta;
        }),
      );

      // updating product and product metas
      await Promise.all([
        entityManager.save(ProductEntity, newProduct),
        entityManager.save(ProductMetaEntity, newProductMetas),
        productMetasToDelete.length > 0 && entityManager.softRemove(ProductMetaEntity, productMetasToDelete),
      ]);
    });

    // handling status update for queue
    switch (updateProductDto.status) {
      case PRODUCT_STATUS_ENUM.SCHEDULED: {
        const currentJob = (await this.productScheduleQueueService.findJobs(['active', 'delayed', 'waiting'])).find(
          (job) => job.id === product.id,
        );

        const isRescheduleRequired =
          product.status === PRODUCT_STATUS_ENUM.SCHEDULED &&
          currentJob &&
          new Date(currentJob.data.scheduledDate).getTime() !== new Date(scheduledDate).getTime();

        if (isRescheduleRequired) {
          await this.productScheduleQueueService.removeJob(product.id);
        }

        await this.productScheduleQueueService.addJob(
          {
            productId: product.id,
            scheduledDate,
          },
          { delay: new Date(scheduledDate).getTime() - Date.now(), jobId: product.id },
        );
        break;
      }
      default:
        if (product.status === PRODUCT_STATUS_ENUM.SCHEDULED) {
          await this.productScheduleQueueService.removeJob(product.id);
        }
        break;
    }
    await this.redisService.invalidateProducts();

    return true;
  }

  @Delete(':id')
  async deleteProduct(@Param() { id }: ValidateIDDto) {
    const product = await this.productService.findOne({
      where: { id },
      relations: ['productMeta'],
      select: {
        id: true,
        productMeta: {
          id: true,
        },
        status: true,
      },
    });

    if (!product) throw new BadRequestException('Product not found');

    switch (product.status) {
      case PRODUCT_STATUS_ENUM.PUBLISHED:
        throw new BadRequestException('Published product cannot be deleted.');
      case PRODUCT_STATUS_ENUM.SCHEDULED:
        await this.productScheduleQueueService.removeJob(product.id);
        break;
      default:
        break;
    }

    await Promise.all([this.productService.softRemove(product), this.redisService.invalidateProducts()]);

    return true;
  }
}
