import { UserEntity, UserRoleEnum } from '@/modules/user/entities';
import { Column, Entity, ManyToOne, Unique, UpdateDateColumn } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'permissions' })
@Unique(['path', 'method'])
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'path', type: 'varchar', nullable: false })
  path: string;

  @Column({ name: 'method', type: 'varchar', nullable: false })
  method: string;

  @Column({ name: 'feature', type: 'varchar' })
  feature: string;

  @Column({ type: 'simple-array', enum: UserRoleEnum, default: [UserRoleEnum.USER] })
  allowedRoles: UserRoleEnum[];

  @Column({ type: 'boolean', default: true })
  isSystemUpdate: boolean;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  updatedBy: UserEntity;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}
