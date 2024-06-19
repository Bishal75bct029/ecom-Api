import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { ProductMetaEntity } from './productMeta.entity';
import { CategoryEntity } from '@/modules/category/entities/category.entity';

@Entity({ name: 'products' })
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'simple-array' })
  tags: string[];

  @ManyToMany(() => CategoryEntity, (category) => category.products)
  @JoinTable({ name: 'product_categories' })
  categories: CategoryEntity[];

  @OneToMany(() => ProductMetaEntity, (productMeta) => productMeta.product)
  productMeta: ProductMetaEntity[];
}
