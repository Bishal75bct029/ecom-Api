import { Injectable } from '@nestjs/common';
import { ProductMetaEntity } from '@/modules/product/entities';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { DiscountEntity } from '@/modules/discount/entity/discount.entity';
import { OrderStatusEnum } from '../entities/order-item.entity';

@Injectable()
export class OrderItemService extends OrderItemRepository {
  private _statusTransitions: Record<OrderStatusEnum, OrderStatusEnum[]> = {
    [OrderStatusEnum.PENDING]: [OrderStatusEnum.SHIPPED],
    [OrderStatusEnum.SHIPPED]: [OrderStatusEnum.DELIVERED],
    [OrderStatusEnum.DELIVERED]: [],
    [OrderStatusEnum.CANCELLED]: [],
  };

  isValidStatusTransition(currentStatus: OrderStatusEnum, newStatus: OrderStatusEnum) {
    const allowedTransitions = this._statusTransitions[currentStatus];
    return allowedTransitions.includes(newStatus);
  }

  calculateTotalPrice(productMetas: ProductMetaEntity[], createOrderDto: CreateOrderDto) {
    return createOrderDto.productMetaIds.reduce((acc, { quantity, id }) => {
      const pricePerUnit = productMetas.find((meta) => meta.id === id).price;

      return acc + quantity * Number(pricePerUnit);
    }, 0);
  }

  calculateDiscountedPrice(totalPrice: number, discount: DiscountEntity) {
    if (totalPrice >= discount.minBuyingPrice) {
      const discountPrice = discount.isPercentage
        ? (totalPrice * Number(discount.amount)) / 100
        : Number(discount.amount);

      totalPrice =
        discountPrice >= discount.maxDiscountPrice
          ? totalPrice - Number(discount.maxDiscountPrice)
          : totalPrice - Number(discountPrice);
    }
  }
}
