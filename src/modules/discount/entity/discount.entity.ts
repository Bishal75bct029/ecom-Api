import { BaseEntity } from '@/libs/entity/base.entity';
import { OrderEntity } from '@/modules/order/entities/order.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('discount')
export class DiscountEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: false })
  couponCode: string;

  @Column({ type: 'varchar', default: '0' })
  amount: string;

  @Column({ type: 'boolean', default: false })
  isPercentage: boolean;

  @Column({ type: 'bigint', default: 0 })
  minBuyingPrice: number;

  @Column({ type: 'bigint' })
  maxDiscountPrice: number;

  @Column({ nullable: false })
  expiryTime: Date;

  @OneToMany(() => OrderEntity, (order) => order.discount)
  orders: OrderEntity;
}
