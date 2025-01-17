import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear, subMonths } from 'date-fns';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatusEnum } from '../entities/order.entity';
import { OrderItemStatusEnum } from '../entities/order-history.entity';

@Injectable()
export class OrderService extends OrderRepository {
  getOrderStatus(orderItems: OrderItemEntity[], newStatus: OrderItemStatusEnum) {
    if (newStatus === OrderItemStatusEnum.CANCELLED) return OrderStatusEnum.CANCELLED;

    if (orderItems.find((orderItems) => orderItems.status === OrderItemStatusEnum.SHIPPED))
      return OrderStatusEnum.PROCESSING;

    return OrderStatusEnum.DELIVERED;
  }
  getFilteredDate(filterTime: 'currentWeek' | 'currentMonth' | 'currentYear') {
    const currentDate = new Date();
    switch (filterTime) {
      case 'currentWeek':
        return {
          startDate: startOfWeek(currentDate, { weekStartsOn: 1 }),
          endDate: endOfWeek(currentDate, { weekStartsOn: 1 }),
        };

      case 'currentMonth':
        const currentMonth = subMonths(new Date(), 0);
        return {
          startDate: startOfMonth(currentMonth),
          endDate: endOfMonth(currentMonth),
        };

      case 'currentYear':
        return {
          startDate: startOfYear(currentDate),
          endDate: endOfYear(currentDate),
        };

      default:
        break;
    }
  }
}
