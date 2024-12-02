import { Column, Entity, OneToMany, OneToOne } from 'typeorm';

import { BaseEntity } from '@/libs/entity/base.entity';
import { ReviewEntity } from '@/modules/review/entities/review.entity';
import { AddressEntity } from './address.entity';
import { OrderEntity } from '@/modules/order/entities/order.entity';
import { CartEntity } from '@/modules/cart/entities/cart.entity';
import { TransactionEntity } from '@/modules/transaction/entities/transaction.entity';
import { CategoryEntity } from '@/modules/category/entities/category.entity';
import { ProductEntity } from '@/modules/product/entities';

export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.USER })
  role: UserRoleEnum;

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @Column({ type: 'boolean', default: false })
  isOtpEnabled?: boolean;

  @OneToMany(() => ReviewEntity, (review) => review.user)
  reviews: ReviewEntity[];

  @OneToMany(() => AddressEntity, (address) => address.user)
  addresses: AddressEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];

  @OneToOne(() => CartEntity, (cart) => cart.user)
  cart: CartEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.user)
  transactions: TransactionEntity[];

  @Column({ type: 'uuid', nullable: true })
  schoolId: string;

  @OneToMany(() => CategoryEntity, (category) => category.updatedAt)
  updatedCategory: CategoryEntity[];

  @OneToMany(() => CategoryEntity, (category) => category.updatedAt)
  updatedProduct: ProductEntity[];
}
