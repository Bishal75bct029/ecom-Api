import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('carts')
export class CartEntity extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'simple-array', nullable: false })
  productMetaId: string[];
}
