import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductMetaEntity } from '@/modules/product/entities/productMeta.entity';

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
@Entity('order_items')
export class OrderItemEntity extends BaseEntity {
  @Column({ type: 'bigint' })
  quantity: number;

  @Column({
    type: 'bigint',
    transformer: {
      to(value: any) {
        return BigInt(value);
      },
      from(value: any) {
        return BigInt(value);
      },
    },
  })
  pricePerUnit: number;

  @Column({
    type: 'bigint',
    transformer: {
      to(value: any) {
        return BigInt(value);
      },
      from(value: any) {
        return BigInt(value);
      },
    },
  })
  totalPrice: number;

  @Column({ type: 'enum', nullable: false, enum: OrderStatusEnum, default: OrderStatusEnum.PENDING })
  status: OrderStatusEnum;

  @ManyToOne(() => ProductMetaEntity, (productMeta) => productMeta.id)
  @JoinColumn()
  productMeta: ProductMetaEntity;

  @ManyToOne(() => OrderEntity, (order) => order.orderItems)
  order: OrderEntity;
}
