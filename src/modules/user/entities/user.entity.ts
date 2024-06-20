import { BaseEntity } from '@/libs/entity/base.entity';
import { ReviewEntity } from '@/modules/review/entities/review.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.USER })
  role: UserRoleEnum;

  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @OneToMany(() => ReviewEntity, (review) => review.user)
  reviews: ReviewEntity[];
}
