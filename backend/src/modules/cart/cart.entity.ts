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
import { CartItem } from './cart-item.entity.js';

@Entity('carts')
export class Cart {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Index('idx_carts_buyer_id')
  @Column({ name: 'buyer_id', type: 'varchar', length: 36 })
  buyerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: Relation<User>;

  @OneToMany(() => CartItem, (item) => item.cart)
  items!: Relation<CartItem[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
