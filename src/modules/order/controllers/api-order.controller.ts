import { Controller, Post, Body, Req, Get, Query, Put, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, In, LessThan, MoreThan } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ProductMetaService } from '../../product/services/product-meta.service';
import { OrderItemService } from '../services/order-item.service';
import { OrderEntity, OrderStatusEnum } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { DiscountService } from '@/modules/discount/services/discount.service';
import { ProductMetaEntity } from '@/modules/product/entities';
import { DiscountEntity } from '@/modules/discount/entity/discount.entity';

@Controller('api/orders')
export class ApiOrderController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderItemService: OrderItemService,
    private readonly discountService: DiscountService,
    private readonly productMetaService: ProductMetaService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    return await this.dataSource.transaction(async (entityManager) => {
      const { id: userId } = req.currentUser;

      const productMetas = await this.productMetaService.find({
        where: { id: In(createOrderDto.productMetaIds.map(({ id }) => id)) },
      });

      const updateProductStock: ProductMetaEntity[] = [];
      let discount: DiscountEntity;
      console.log(productMetas);

      for (const product of productMetas) {
        const productFromOrder = createOrderDto.productMetaIds.find((item) => item.id === product.id);
        if (product.stock < productFromOrder?.quantity)
          throw new BadRequestException('Quantity exceeds available quantity');

        updateProductStock.push({ ...product, stock: product.stock - productFromOrder.quantity });
      }

      console.log(updateProductStock);

      await entityManager.save(ProductMetaEntity, updateProductStock);

      let totalPrice = createOrderDto.productMetaIds.reduce((acc, { quantity, id }) => {
        const pricePerUnit = productMetas.find((meta) => meta.id === id).price;

        return acc + quantity * pricePerUnit;
      }, 0);

      if (createOrderDto.couponCode) {
        discount = await this.discountService.findOne({
          where: { couponCode: createOrderDto.couponCode, expiryTime: MoreThan(new Date(new Date().toISOString())) },
        });

        if (totalPrice >= discount.minBuyingPrice) {
          const discountPrice = discount.isPercentage
            ? Math.floor((totalPrice * parseInt(discount.amount)) / 100)
            : parseInt(discount.amount);

          totalPrice =
            discountPrice >= discount.maxDiscountPrice
              ? totalPrice - discount.maxDiscountPrice
              : totalPrice - discountPrice;
        }
      }
      const order = await entityManager.save(OrderEntity, {
        totalPrice,
        user: {
          id: userId,
        },
        discount: {
          id: discount.id,
        },
      });

      const orderItems = productMetas.map((productMeta) => {
        const quantity = createOrderDto.productMetaIds.find(({ id }) => id === productMeta.id).quantity;

        return {
          productMeta,
          pricePerUnit: productMeta.price,
          quantity,
          totalPrice: quantity * productMeta.price,
          order,
        };
      });

      const createdOrderItems = this.orderItemService.createMany(orderItems);
      order.orderItems = createdOrderItems;
      await entityManager.save(OrderItemEntity, createdOrderItems);

      return order;
    });
  }
}
