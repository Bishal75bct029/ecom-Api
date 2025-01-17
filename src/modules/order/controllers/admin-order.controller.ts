import { Controller, Body, Put, Param, BadRequestException, Get, Query, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource, In, Like } from 'typeorm';

import { OrderService } from '../services/order.service';
import { UpdateOrderStatusDto } from '../dto/update-order.dto';
import { ProductMetaService } from '../../product/services/product-meta.service';
import { ProductMetaEntity } from '../../product/entities/productMeta.entity';
import { ValidateIDDto } from '@/common/dtos';
import { OrderItemService } from '../services/order-item.service';
import { OrderItemEntity } from '../entities/order-item.entity';
import { ProductEntity } from '@/modules/product/entities';
import { getPaginatedResponse } from '@/common/utils';
import { FilterOrderQuery, OrderQueryDto } from '../dto/create-order.dto';
import { OrderEntity, OrderStatusEnum } from '../entities/order.entity';
import { OrderItemStatusEnum } from '../entities/order-history.entity';

@ApiTags('Admin Order')
@Controller('admin/orders')
export class AdminOrderController {
  constructor(
    private dataSource: DataSource,
    private readonly orderService: OrderService,
    private readonly orderItemService: OrderItemService,
    private readonly productMetaService: ProductMetaService,
  ) {}

  @Get()
  async getOrders(@Query() query: OrderQueryDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', status, search } = query;

    const [orders, count] = await this.orderService.findAndCount({
      take: limit,
      skip: Math.floor(limit * (page - 1)),
      relations: ['orderItems', 'user'],
      select: {
        id: true,
        status: true,
        createdAt: true,
        totalPrice: true,
        orderItems: {
          id: true,
          pricePerUnit: true,
          orderHistory: { status: true },
        },
        user: {
          id: true,
          email: true,
          name: true,
        },
      },
      where: {
        ...(search && { user: { email: Like(`%${search}%`) } }),
        ...(status && { status }),
      },
      order: sortBy === 'user' ? { user: { name: order } } : { [sortBy]: order },
    });

    return {
      items: orders.map((order) => ({ ...order, totalPrice: Number(order.totalPrice) / 100 })),
      ...getPaginatedResponse({ count, limit, page }),
    };
  }

  @Get('order-count')
  async getOrderCount(@Query() filterOrderQuery: FilterOrderQuery) {
    const { filterTime } = filterOrderQuery;

    const queryBuilder = this.orderService
      .createQueryBuilder('order')
      .select([
        `SUM(CASE WHEN order.status = 'PENDING' THEN 1 ELSE 0 END) AS pending`,
        `SUM(CASE WHEN order.status = 'PROCESSING' THEN 1 ELSE 0 END) AS processing`,
        `SUM(CASE WHEN order.status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered`,
        `SUM(CASE WHEN order.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled`,
      ]);

    if (filterTime) {
      const { startDate, endDate } = this.orderService.getFilteredDate(filterTime);
      queryBuilder
        .where('order.createdAt >= :startDate', { startDate })
        .andWhere('order.createdAt <= :endDate', { endDate });
    }

    const orderCount = await queryBuilder.getRawOne();

    return {
      pending: parseInt(orderCount.pending, 10),
      processing: parseInt(orderCount.processing, 10),
      delivered: parseInt(orderCount.delivered, 10),
      cancelled: parseInt(orderCount.cancelled, 10),
    };
  }

  @Get(':id')
  async getOrder(@Param() { id }: ValidateIDDto) {
    const order = await this.orderService.findOne({
      where: { id },
      relations: [
        'orderItems',
        'user',
        'shippingAddress',
        'billingAddress',
        'orderItems.productMeta',
        'orderItems.orderHistory',
        'orderItems.orderHistory.updatedBy',
        'orderItems.productMeta.product',
        'transaction',
        'transaction.paymentMethod',
      ],
      select: {
        id: true,
        status: true,
        totalPrice: true,
        note: true,
        user: {
          id: true,
          email: true,
          name: true,
        },
        transaction: {
          transactionId: true,
          paymentMethod: {
            name: true,
            image: true,
          },
        },
        shippingAddress: {
          name: true,
          type: true,
          contact: true,
        },
        billingAddress: {
          name: true,
          type: true,
          contact: true,
        },
        orderItems: {
          id: true,
          orderHistory: {
            status: true,
            comment: true,
            createdAt: true,
            updatedBy: { name: true },
          },
          pricePerUnit: true,
          quantity: true,
          productMeta: {
            images: true,
            sku: true,
            attributes: {},
            product: {
              name: true,
            },
          },
        },
      },
    });
    if (!order) throw new BadRequestException('Order not found');

    console.log(order.orderItems);
    return {
      ...order,
      transactionId: order.transaction.transactionId,
      paymentMethod: { ...order.transaction.paymentMethod },
      orderItems: order.orderItems.map((item) => {
        const { productMeta, ...rest } = item;
        const { product, ...metaRest } = productMeta;

        return {
          name: product.name,
          ...rest,
          ...metaRest,
          orderHistory: item.orderHistory.map((history) => ({ ...history, updatedBy: history.updatedBy.name })),
        };
      }),
    };
  }

  @Put(':id/status')
  async update(@Body() updateOrderStatusDto: UpdateOrderStatusDto, @Param() { id }: ValidateIDDto) {
    const { status, orderItemId } = updateOrderStatusDto;

    const order = await this.orderService.findOne({
      where: { id },
      relations: { orderItems: { productMeta: true } },
    });

    if (!order) throw new BadRequestException('Order not found');

    let isUpdated = false;
    let orderItem: OrderItemEntity;
    if (orderItemId) {
      if (!this.orderItemService.isValidStatusTransition(orderItem.status, status)) console.log('here');
      orderItem = order.orderItems.find((item) => orderItemId === item.id);
      throw new BadRequestException('Invalid status transition');
    } else {
      if (order.status !== OrderStatusEnum.PENDING) throw new BadRequestException('Invalid status transition');
    }

    // increase product quantity when status is Cancelled
    await this.dataSource.transaction(async (entityManager) => {
      if (status === OrderItemStatusEnum.CANCELLED) {
        const orderItemsIds = order.orderItems.map((orderItem) => orderItem.id);
        const productMetas = await this.productMetaService.find({
          where: { id: In(orderItemsIds) },
          relations: ['product'],
          select: {
            id: true,
            stock: true,
            product: {
              id: true,
              stock: true,
            },
          },
        });

        const stockUpdatedProduct = new Map<string, ProductEntity>();
        productMetas.forEach((productMeta) => {
          const increasedStock = order.orderItems.find((item) => item.productMeta.id === productMeta.id).quantity;
          productMeta.stock += Number(increasedStock ?? 0);

          const product = stockUpdatedProduct.get(productMeta.product.id) || { ...productMeta.product };
          product.stock += Number(increasedStock ?? 0);
          stockUpdatedProduct.set(productMeta.product.id, product);
        });

        const createdOrderItems = this.orderItemService.createMany(
          order.orderItems.map((item) => ({ ...item, status: OrderItemStatusEnum.CANCELLED })),
        );
        const newOrderStatus = this.orderService.getOrderStatus(createdOrderItems, status);

        await Promise.all([
          entityManager.save(OrderItemEntity, createdOrderItems),
          entityManager.save(OrderEntity, { id, status: newOrderStatus }),
          entityManager.save(ProductEntity, [...stockUpdatedProduct.values()]),
          entityManager.save(ProductMetaEntity, productMetas),
        ]);

        isUpdated = true;
      }

      if (orderItem) {
        await entityManager.save(OrderItemEntity, { ...orderItem, status });
        isUpdated = true;
      }
    });

    if (isUpdated) {
      return { message: 'Order status updated successfully' };
    }

    throw new BadRequestException('Invalid request');
  }

  @Delete(':id')
  async deleteOrder(@Param() { id }: ValidateIDDto) {
    const order = await this.orderService.findOne({
      where: { id },
      relations: ['orderItems'],
      select: { id: true, status: true, orderItems: { id: true } },
    });
    if (!order || order.status !== OrderStatusEnum.CANCELLED) {
      throw new BadRequestException('Invalid request');
    }

    return this.orderService.softRemove(order);
  }
}
