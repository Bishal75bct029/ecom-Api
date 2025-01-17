import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { OrderEntity } from '@/modules/order/entities/order.entity';

export enum AddressTypeEnum {
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
}

@Entity('addresses')
export class AddressEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  contact: string;

  @Column({ type: 'enum', enum: AddressTypeEnum, default: AddressTypeEnum.SHIPPING })
  type: AddressTypeEnum;

  @ManyToOne(() => UserEntity, (user) => user.addresses)
  user: UserEntity;

  @OneToMany(() => OrderEntity, (order) => order.billingAddress)
  billingOrders: OrderEntity[];

  @OneToMany(() => OrderEntity, (order) => order.shippingAddress)
  shippingOrders: OrderEntity[];
}
