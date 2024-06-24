import { Controller, Body, Put, Param, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource, In } from 'typeorm';
import { OrderService } from './order.service';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { OrderEntity, OrderStatusEnum } from './entities/order.entity';
import { ProductMetaService } from '../product/product-meta.service';
import { ProductMetaEntity } from '../product/entities/productMeta.entity';

@ApiTags('Admin Order')
@Controller('admin/orders')
export class AdminOrderController {
  constructor(
    private dataSource: DataSource,
    private readonly orderService: OrderService,
    private readonly productMetaService: ProductMetaService,
  ) {}

  @Put(':id/status')
  async update(@Body() updateOrderStatusDto: UpdateOrderStatusDto, @Param('id') id: string) {
    let order = await this.orderService.findOne({ where: { id }, relations: { orderItems: { productMeta: true } } });

    if (!order) throw new BadRequestException('Order not found');

    if (!this.orderService.isValidStatusTransition(order.status, updateOrderStatusDto.status))
      throw new BadRequestException('Invalid status transition');

    // reduce product quantity when status is PACKED
    await this.dataSource.transaction(async (entityManager) => {
      if (updateOrderStatusDto.status === OrderStatusEnum.PACKED) {
        const productMetas = await this.productMetaService.find({
          where: { id: In(order.orderItems.map((item) => item.productMeta.id)) },
        });
        productMetas.forEach((productMeta) => {
          productMeta.stock =
            productMeta.stock - order.orderItems.find((item) => item.productMeta.id === productMeta.id).quantity;
        });
        await entityManager.save(ProductMetaEntity, productMetas);
      }
      order = await entityManager.save(OrderEntity, { ...order, status: updateOrderStatusDto.status });
    });
    return order;
  }
}
