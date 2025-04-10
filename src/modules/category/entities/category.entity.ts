import { BaseEntity } from '@/libs/entity/base.entity';
import { ProductEntity } from '@/modules/product/entities';
import { Entity, Tree, Column, TreeChildren, TreeParent, ManyToMany, ManyToOne } from 'typeorm';
import { UserEntity } from '@/modules/user/entities';
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

  @TreeChildren({ cascade: true })
  children: CategoryEntity[];

  @TreeParent()
  parent: CategoryEntity;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => UserEntity, (user) => user.updatedCategory)
  updatedBy: UserEntity;

  @ManyToMany(() => ProductEntity, (product) => product.categories)
  products: ProductEntity[];
}
