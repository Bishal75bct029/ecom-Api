import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '@/libs/entity/base.entity';
import { ProductMetaEntity } from './productMeta.entity';
import { CategoryEntity } from '@/modules/category/entities/category.entity';
import { ReviewEntity } from '@/modules/review/entities/review.entity';
import { UserEntity } from '@/modules/user/entities';

export enum PRODUCT_STATUS_ENUM {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  SCHEDUDLED = 'scheduled',
}
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

  @Column({ type: 'enum', enum: PRODUCT_STATUS_ENUM, default: PRODUCT_STATUS_ENUM.DRAFT })
  status: PRODUCT_STATUS_ENUM;

  @ManyToOne(() => UserEntity, (user) => user.updatedCategory)
  updatedBy: UserEntity;

  @Column({ type: 'jsonb', nullable: true })
  attributeOptions: { [key: string]: string[] };

  @ManyToMany(() => CategoryEntity, (category) => category.products)
  @JoinTable({ name: 'product_categories' })
  categories: CategoryEntity[];

  @Column({ type: 'int', default: 0 })
  stock: number;

  @OneToMany(() => ProductMetaEntity, (productMeta) => productMeta.product, { cascade: ['soft-remove'] })
  productMeta: ProductMetaEntity[];

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @OneToMany(() => ReviewEntity, (review) => review.product)
  reviews: ReviewEntity[];
}
