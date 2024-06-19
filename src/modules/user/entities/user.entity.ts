import { BaseEntity } from '@/libs/entity/base.entity';
import { ReviewEntity } from '@/modules/review/entities/review.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  image: string;

  @OneToMany(() => ReviewEntity, (review) => review.user)
  reviews: ReviewEntity[];
}
