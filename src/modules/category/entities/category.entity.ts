import { BaseEntity } from '@/libs/entity/base.entity';
import { ProductEntity } from '@/modules/product/entities';
import { Entity, Tree, Column, TreeChildren, TreeParent, ManyToMany } from 'typeorm';
import { CategoryStatusEnum } from '../dto';

@Entity({ name: 'categories' })
@Tree('materialized-path')
export class CategoryEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'enum', enum: CategoryStatusEnum, default: CategoryStatusEnum.INACTIVE })
  status: CategoryStatusEnum;

  @TreeChildren()
  children: CategoryEntity[];

  @TreeParent()
  parent: CategoryEntity;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  createdBy: string;

  @Column({ type: 'text', nullable: true })
  updatedBy: string;

  @ManyToMany(() => ProductEntity, (product) => product.categories)
  products: ProductEntity[];
}
