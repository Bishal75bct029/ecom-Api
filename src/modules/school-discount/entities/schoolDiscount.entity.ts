import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('school_discounts')
export class SchoolDiscountEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to(value: any) {
        return Number(value);
      },
      from(value: any) {
        return Number(value);
      },
    },
  })
  discountPercentage: number;

  @Column({ type: 'jsonb', default: {} })
  schoolMeta: object;

  @Column({ type: 'uuid', unique: true })
  schoolId: string;
}
