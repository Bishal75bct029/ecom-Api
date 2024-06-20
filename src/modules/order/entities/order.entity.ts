import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'bigint', nullable: false })
  totalPrice: number;

  @Column({ type: 'text', nullable: false })
  shippingAddress: string;

  @Column({ type: 'text', nullable: false })
  billingAddress: string;

  @Column({ type: 'text', nullable: false })
  shippingContact: string;

  @Column({ type: 'text', nullable: false })
  billingContact: string;
}
