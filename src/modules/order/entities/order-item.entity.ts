import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductMetaEntity } from '@/modules/product/entities/productMeta.entity';

@Entity('order_items')
export class OrderItemEntity extends BaseEntity {
  @Column({ type: 'bigint' })
  quantity: number;

  @Column({ type: 'bigint' })
  pricePerUnit: number;

  @Column({ type: 'bigint' })
  totalPrice: number;

  @ManyToOne(() => ProductMetaEntity, (productMeta) => productMeta.id)
  @JoinColumn()
  productMeta: ProductMetaEntity;

  @ManyToOne(() => OrderEntity, (order) => order.orderItems)
  order: OrderEntity;
}
