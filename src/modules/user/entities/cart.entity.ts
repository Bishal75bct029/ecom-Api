import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('carts')
export class UserEntity extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'uuid', nullable: false })
  productMetaId: string;

  @Column({ type: 'bigint', nullable: false })
  quantity: string;
}
