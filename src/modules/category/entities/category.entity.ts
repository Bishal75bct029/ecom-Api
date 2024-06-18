import { BaseEntity } from '@/libs/entity/base.entity';
import { ProductEntity } from '@/modules/product/entities/product.entity';
import {
  Entity,
  Tree,
  Column,
  TreeChildren,
  TreeParent,
  ManyToMany,
} from 'typeorm';

@Entity({ name: 'categories' })
@Tree('materialized-path')
export class CategoryEntity extends BaseEntity {
  @Column()
  name: string;

  @TreeChildren()
  children: CategoryEntity[];

  @TreeParent()
  parent: CategoryEntity;

  @ManyToMany(() => ProductEntity, (product) => product.categories)
  products: ProductEntity[]
}
