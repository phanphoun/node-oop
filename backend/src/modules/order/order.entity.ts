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
import { OrderItem } from './order-item.entity.js';
import { OrderStatus, PaymentStatus } from '../../constants/status.enum.js';

@Entity('orders')
export class Order {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Index('idx_orders_buyer_id')
  @Column({ name: 'buyer_id', type: 'varchar', length: 36 })
  buyerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: Relation<User>;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ name: 'payment_status', type: 'varchar', length: 50, default: PaymentStatus.Pending })
  paymentStatus!: PaymentStatus;

  @Column({ name: 'order_status', type: 'varchar', length: 50, default: OrderStatus.Pending })
  orderStatus!: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: Relation<OrderItem[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
