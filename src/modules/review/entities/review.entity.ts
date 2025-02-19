import { BaseEntity } from '@/libs/entity/base.entity';
import { ProductEntity } from '@/modules/product/entities/product.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('reviews')
export class ReviewEntity extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'bigint', nullable: false })
  rating: number;

  @ManyToOne(() => ProductEntity, (product) => product.reviews)
  product: ProductEntity;

  @ManyToOne(() => UserEntity, (user) => user.reviews)
  user: UserEntity;
}
