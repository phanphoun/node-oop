import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum UserRole {
  Admin = 'Admin',
  BusinessOwner = 'BusinessOwner',
  Buyer = 'Buyer',
}

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.Buyer })
  role!: UserRole;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'boolean', default: true })
  status!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
