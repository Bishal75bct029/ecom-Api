import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt: Date;

  @CreateDateColumn({ nullable: false, select: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true, select: false })
  updatedAt: Date;
}
