import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '@/libs/entity/base.entity';
import { ProductMetaEntity } from './productMeta.entity';
import { CategoryEntity } from '@/modules/category/entities/category.entity';
import { ReviewEntity } from '@/modules/review/entities/review.entity';
import { UserEntity } from '@/modules/user/entities';
import { Attribute } from '../dto';

export enum PRODUCT_STATUS_ENUM {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
}
@Entity({ name: 'products' })
export class ProductEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'simple-array', default: [] })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  attributes: Attribute[];

  @Column({ type: 'enum', enum: PRODUCT_STATUS_ENUM, default: PRODUCT_STATUS_ENUM.DRAFT })
  status: PRODUCT_STATUS_ENUM;

  // @Column({ type: 'jsonb', nullable: true })
  // attributeOptions: { [key: string]: string[] };

  @Column({ type: 'timestamptz', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @OneToMany(() => ProductMetaEntity, (productMeta) => productMeta.product, { cascade: ['soft-remove'] })
  productMeta: ProductMetaEntity[];

  @ManyToMany(() => CategoryEntity, (category) => category.products)
  @JoinTable({ name: 'product_categories' })
  categories: CategoryEntity[];

  @ManyToOne(() => UserEntity, (user) => user.updatedCategory)
  updatedBy: UserEntity;

  @OneToMany(() => ReviewEntity, (review) => review.product)
  reviews: ReviewEntity[];
}
