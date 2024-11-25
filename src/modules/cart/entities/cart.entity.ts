import { BaseEntity } from '@/libs/entity/base.entity';
import { UserEntity } from '@/modules/user/entities';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('carts')
export class CartEntity extends BaseEntity {
  @OneToOne(() => UserEntity, (user) => user.cart)
  @JoinColumn()
  user: UserEntity | string;

  @Column({ type: 'simple-json', nullable: true })
  cartItems: CartItem[];
}

type CartItem = {
  productMetaId: string;
  quantity: number;
};
