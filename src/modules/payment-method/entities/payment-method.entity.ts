export class PaymentMethod {}
import { BaseEntity } from '@/libs/entity/base.entity';
import { TransactionEntity } from '@/modules/transaction/entities/transaction.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('payment_methods')
export class PaymentMethodEntity extends BaseEntity {
  @Column({ name: 'name', nullable: false, unique: true })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image', type: 'varchar', nullable: true })
  image: string;

  @Column({ name: 'isActive', type: 'bool', nullable: false, default: true })
  isActive: boolean;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.paymentMethod)
  transactions: TransactionEntity[];
}
