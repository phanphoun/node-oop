import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { User } from '../auth/user.entity.js';
import { Product } from '../product/product.entity.js';

@Entity('favorites')
@Index('idx_favorites_buyer_product', ['buyerId', 'productId'], { unique: true })
export class Favorite {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ name: 'buyer_id', type: 'varchar', length: 36 })
  buyerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: Relation<User>;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Relation<Product>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
