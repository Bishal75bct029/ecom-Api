import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('order_items')
export class OrderItemEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  productMetaId: string;

  @Column({ type: 'bigint' })
  quanity: number;

  @Column({ type: 'bigint' })
  pricePerUnit: number;

  @Column({ type: 'bigint' })
  totalPrice: number;
}
