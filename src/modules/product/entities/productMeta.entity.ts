import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ProductEntity } from './product.entity';
import { Images } from '../dto';

@Entity('product_meta')
export class ProductMetaEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  sku: string;

  @Column({ type: 'jsonb', nullable: true })
  images: Images[];

  @Column({
    type: 'bigint',
    nullable: false,
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

  @Column({ type: 'jsonb', nullable: true, default: {} })
  attributes?: object;

  @Column({ type: 'bool', default: false, nullable: false })
  isDefault?: boolean;

  @Column({ nullable: false })
  stock: number;

  @ManyToOne(() => ProductEntity, (product) => product.productMeta, { onDelete: 'CASCADE' })
  product: ProductEntity;
}
