import { Controller, Body, Put, Param, BadRequestException, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource, In } from 'typeorm';
import { OrderService } from '../services/order.service';
import { UpdateOrderStatusDto } from '../dto/update-order.dto';
import { OrderEntity, OrderStatusEnum } from '../entities/order.entity';
import { ProductMetaService } from '../../product/services/product-meta.service';
import { ProductMetaEntity } from '../../product/entities/productMeta.entity';
import { ValidateIDDto } from '@/common/dtos';

@ApiTags('Admin Order')
@Controller('admin/orders')
export class AdminOrderController {
  constructor(
    private dataSource: DataSource,
    private readonly orderService: OrderService,
    private readonly productMetaService: ProductMetaService,
  ) {}

  @Get()
  async getOrders(@Query() query: Pagination) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const [orders, count] = await this.orderService.findAndCount({
      take: limit,
      skip: Math.floor(limit * (page - 1)),
      relations: ['orderItems'],
      select: {
        id: true,
        status: true,
        orderItems: {
          pricePerUnit: true,
          id: true,
        },
      },
    });

    return { orders, count, totalPage: Math.ceil(count / limit) };
  }

  @Put(':id/status')
  async update(@Body() updateOrderStatusDto: UpdateOrderStatusDto, @Param() { id }: ValidateIDDto) {
    let order = await this.orderService.findOne({ where: { id }, relations: { orderItems: { productMeta: true } } });

    if (!order) throw new BadRequestException('Order not found');

    if (!this.orderService.isValidStatusTransition(order.status, updateOrderStatusDto.status))
      throw new BadRequestException('Invalid status transition');

    // increase product quantity when status is Cancelled
    await this.dataSource.transaction(async (entityManager) => {
      if (updateOrderStatusDto.status === OrderStatusEnum.CANCELLED) {
        const productMetas = await this.productMetaService.find({
          where: { id: In(order.orderItems.map((item) => item.productMeta.id)) },
        });
        productMetas.forEach((productMeta) => {
          productMeta.stock =
            productMeta.stock + order.orderItems.find((item) => item.productMeta.id === productMeta.id).quantity;
        });
        await entityManager.save(ProductMetaEntity, productMetas);
      }
      order = await entityManager.save(OrderEntity, { ...order, status: updateOrderStatusDto.status });
    });

    return order;
  }
}
