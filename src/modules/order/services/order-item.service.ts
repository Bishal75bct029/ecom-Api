import { Injectable } from '@nestjs/common';
import { ProductMetaEntity } from '@/modules/product/entities';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { DiscountEntity } from '@/modules/discount/entity/discount.entity';
import { OrderItemStatusEnum } from '../entities/order-history.entity';

@Injectable()
export class OrderItemService extends OrderItemRepository {
  private _statusTransitions: Record<OrderItemStatusEnum, OrderItemStatusEnum[]> = {
    [OrderItemStatusEnum.PENDING]: [OrderItemStatusEnum.SHIPPED],
    [OrderItemStatusEnum.SHIPPED]: [OrderItemStatusEnum.DELIVERED],
    [OrderItemStatusEnum.DELIVERED]: [],
    [OrderItemStatusEnum.CANCELLED]: [],
  };

  isValidStatusTransition(currentStatus: OrderItemStatusEnum, newStatus: OrderItemStatusEnum) {
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
