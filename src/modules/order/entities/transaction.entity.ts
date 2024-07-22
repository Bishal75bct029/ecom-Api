import { BaseEntity } from '@/libs/entity/base.entity';
import { OrderEntity } from '@/modules/order/entities/order.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { PaymentMethoEntity } from './payment-method.entity';
import { UserEntity } from '@/modules/user/entities';

@Entity('transcations')
export class TransactionEntity extends BaseEntity {
  @Column({ name: 'isSuccess', default: false, type: 'bool' })
  isSuccess: boolean;

  @Column({ name: 'responseJson', default: {}, type: 'jsonb' })
  responseJson: object;

  @Column({ name: 'transactionId', type: 'varchar', nullable: true })
  transactionId: string;

  @Column({ name: 'remarks', type: 'varchar', nullable: true })
  remarks: string;

  @Column({
    name: 'transactionCode',
    type: 'varchar',
    nullable: true,
  })
  transactionCode: string;

  @Column({
    name: 'paymentGatewayCharge',
    type: 'bigint',
    nullable: true,
    comment: 'charge of paymentGateway',
  })
  paymentGatewayCharge: number;

  @Column({
    name: 'price',
    type: 'bigint',
    nullable: false,
    comment: 'price is in rs or cents depending on currency type',
  })
  price: number;

  @OneToOne(() => OrderEntity)
  @JoinColumn()
  order: OrderEntity | string;

  @ManyToOne(() => PaymentMethoEntity, (paymentMethod) => paymentMethod.transactions)
  paymentMethod: PaymentMethoEntity;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  user: UserEntity;
}
