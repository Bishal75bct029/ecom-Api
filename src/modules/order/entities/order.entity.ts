import { BaseEntity } from '@/libs/entity/base.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { DiscountEntity } from '@/modules/discount/entity/discount.entity';

export enum OrderStatusEnum {
  PLACED = 'PLACED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @Column({
    type: 'bigint',
    nullable: true,
    transformer: {
      to(value: any) {
        BigInt(value);
      },
      from(value: any) {
        BigInt(value);
      },
    },
  })
  totalPrice: number;

  @Column({ type: 'enum', nullable: false, enum: OrderStatusEnum, default: OrderStatusEnum.PLACED })
  status: OrderStatusEnum;

  @OneToMany(() => OrderItemEntity, (orderItems) => orderItems.order)
  orderItems: OrderItemEntity[];

  @ManyToOne(() => UserEntity, (user) => user.orders)
  user: UserEntity;

  @ManyToOne(() => DiscountEntity, (discount) => discount.orders)
  discount: DiscountEntity;
}
