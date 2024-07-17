import { BaseEntity } from '@/libs/entity/base.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { ProductMetaEntity } from './productMeta.entity';
import { CategoryEntity } from '@/modules/category/entities/category.entity';
import { ReviewEntity } from '@/modules/review/entities/review.entity';

@Entity({ name: 'products' })
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'simple-array' })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  attributes: string[];

  @Column({ type: 'jsonb', nullable: true })
  attributesOptions: { [key: string]: string[] };

  @Column({ type: 'jsonb', nullable: true })
  variants: Array<{ [key: string]: string }>;

  @ManyToMany(() => CategoryEntity, (category) => category.products)
  @JoinTable({ name: 'product_categories' })
  categories: CategoryEntity[];

  @OneToMany(() => ProductMetaEntity, (productMeta) => productMeta.product)
  productMeta: ProductMetaEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.product)
  reviews: ReviewEntity[];
}
