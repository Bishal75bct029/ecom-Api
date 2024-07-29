import { BaseEntity } from '@/libs/entity/base.entity';
import { OrderEntity } from '@/modules/order/entities/order.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { UserEntity } from '@/modules/user/entities';
import { PaymentMethodEntity } from '@/modules/payment-method/entities/payment-method.entity';

@Entity('transactions')
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
    transformer: {
      to(value: any) {
        return BigInt(value);
      },
      from(value: any) {
        return BigInt(value);
      },
    },
  })
  price: number;

  @OneToOne(() => OrderEntity)
  @JoinColumn()
  order: OrderEntity;

  @ManyToOne(() => PaymentMethodEntity, (paymentMethod) => paymentMethod.transactions)
  paymentMethod: PaymentMethodEntity;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  user: UserEntity;
}
