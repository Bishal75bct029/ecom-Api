import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DeleteDateColumn({ nullable: true, type: 'timestamptz', select: false })
  deletedAt: Date;

  @CreateDateColumn({ nullable: false, type: 'timestamptz', select: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true, type: 'timestamptz', select: false })
  updatedAt: Date;
}
