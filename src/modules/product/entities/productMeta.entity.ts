import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/libs/entity/base.entity';
import { ProductEntity } from './product.entity';

@Entity('product_meta')
export class ProductMetaEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  sku: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({
    type: 'bigint',
    nullable: false,
    transformer: {
      to(value: any) {
        return BigInt(value ?? 0);
      },
      from(value: any) {
        return BigInt(value ?? 0);
      },
    },
  })
  price: number;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  attributes?: object;

  @Column({ type: 'bool', default: false, nullable: false })
  isDefault?: boolean;

  @Column({ nullable: false })
  stock: number;

  @ManyToOne(() => ProductEntity, (product) => product.productMeta, { onDelete: 'CASCADE' })
  product: ProductEntity;
}
