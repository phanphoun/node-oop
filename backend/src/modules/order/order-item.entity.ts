import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { Order } from './order.entity.js';
import { Product } from '../product/product.entity.js';

@Entity('order_items')
export class OrderItem {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Index('idx_order_items_order_id')
  @Column({ name: 'order_id', type: 'varchar', length: 36 })
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Relation<Order>;

  @Index('idx_order_items_product_id')
  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Relation<Product>;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;
}
