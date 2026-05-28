
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price!: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  sku!: string | null;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'boolean', default: true })
  status!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}


