import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../auth/user.entity.js';
import { Category } from '../category/category.entity.js';
import { Review } from '../review/review.entity.js';

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Index('idx_products_name')
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index('idx_products_price')
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price!: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  sku!: string | null;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Index('idx_products_category_id')
  @Column({ name: 'category_id', type: 'varchar', length: 36, nullable: true })
  categoryId!: string | null;

  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category!: Relation<Category> | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image!: string | null;

  @Index('idx_products_seller_id')
  @Column({ name: 'seller_id', type: 'varchar', length: 36, nullable: true })
  sellerId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'seller_id' })
  seller!: Relation<User> | null;

  @Column({ type: 'boolean', default: true })
  status!: boolean;

  @OneToMany(() => Review, (review) => review.product)
  reviews!: Relation<Review[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
