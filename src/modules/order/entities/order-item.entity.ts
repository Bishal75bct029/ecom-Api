import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductMetaEntity } from '@/modules/product/entities/productMeta.entity';
import { OrderItemStatusEnum, OrderStatusHistoryEntity } from './order-history.entity';

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

  @OneToMany(() => OrderStatusHistoryEntity, (orderHistory) => orderHistory.orderItems, { cascade: ['soft-remove'] })
  orderHistory: OrderStatusHistoryEntity[];

  @ManyToOne(() => ProductMetaEntity, (productMeta) => productMeta.id)
  @JoinColumn()
  productMeta: ProductMetaEntity;

  status?: OrderItemStatusEnum;

  @ManyToOne(() => OrderEntity, (order) => order.orderItems)
  order: OrderEntity;

  // @AfterLoad()
  // setLatestStatus() {
  //   console.log(this.orderHistory, 'length');
  //   if (this.orderHistory && this.orderHistory.length > 0) {
  //     this.orderHistory.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  //     const latestHistory = this.orderHistory[0];
  //     if (latestHistory) {
  //       this.status = latestHistory.status;
  //     }
  //   }
  // }
}
