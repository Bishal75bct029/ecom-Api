import { BaseEntity } from './base.entity';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';
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
