import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { TransactionEntity } from './transaction.entity';

@Entity('payment_methods')
export class PaymentMethoEntity extends BaseEntity {
  @Column({ name: 'name', nullable: false, unique: true })
  name: string;

  @Column({ name: 'isActive', type: 'bool', nullable: false, default: true })
  isActive: boolean;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.paymentMethod)
  transactions: TransactionEntity[];
}
