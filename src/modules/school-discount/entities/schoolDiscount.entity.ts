import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('school_discounts')
export class SchoolDiscountEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int' })
  discountPercentage: number;

  @Column({ type: 'jsonb', default: {} })
  schoolMeta: object;

  @Column({ type: 'varchar', unique: true })
  schoolId: string;
}
