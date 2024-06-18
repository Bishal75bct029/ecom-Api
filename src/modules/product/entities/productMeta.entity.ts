import { BaseEntity } from '@/libs/entity/base.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('product_meta')
export class ProductMetaEntity extends BaseEntity {
  @ManyToOne(() => ProductEntity, (product) => product.productMeta)
  product: ProductEntity

}
