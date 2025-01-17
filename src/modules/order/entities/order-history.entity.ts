import { Column, Entity, ManyToOne } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { BaseEntity } from '@/libs/entity/base.entity';
import { UserEntity } from '@/modules/user/entities';

export enum OrderItemStatusEnum {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'order_status_history' })
export class OrderStatusHistoryEntity extends BaseEntity {
  @Column({ nullable: true })
  comment?: string;

  @Column({ type: 'enum', nullable: false, enum: OrderItemStatusEnum, default: OrderItemStatusEnum.PENDING })
  status: OrderItemStatusEnum;

  @ManyToOne(() => OrderItemEntity, (orderItems) => orderItems.orderHistory)
  orderItems: OrderItemEntity;

  @ManyToOne(() => UserEntity, (updatedBy) => updatedBy.orderHistory)
  updatedBy: UserEntity;
}
