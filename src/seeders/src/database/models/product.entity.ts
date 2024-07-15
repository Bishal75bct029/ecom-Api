import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { ProductMetaEntity } from './productMeta.entity';
import { BaseEntity } from './base.entity';
import { CategoryEntity } from './category.entity';
import { ReviewEntity } from './review.entity';

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
