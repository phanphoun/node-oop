import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { Cart } from './cart.entity.js';
import { Product } from '../product/product.entity.js';

@Entity('cart_items')
@Index('idx_cart_items_cart_product', ['cartId', 'productId'], { unique: true })
export class CartItem {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ name: 'cart_id', type: 'varchar', length: 36 })
  cartId!: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart!: Relation<Cart>;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Relation<Product>;

  @Column({ type: 'int' })
  quantity!: number;
}
