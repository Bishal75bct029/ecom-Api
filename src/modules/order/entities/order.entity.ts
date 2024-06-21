import { BaseEntity } from '@/libs/entity/base.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'bigint', nullable: false })
  totalPrice: number;

  @OneToMany(() => OrderItemEntity, (orderItems) => orderItems.order)
  orderItems: OrderItemEntity[];

  @ManyToOne(() => UserEntity, (user) => user.orders)
  user: UserEntity;
}
