import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, type Relation } from 'typeorm';
import { Order } from '../order/order.entity.js';
import { User } from '../auth/user.entity.js';
import { PaymentStatus } from '../../constants/status.enum.js';

@Entity('payments')
export class Payment {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Index('idx_payments_order_id')
  @Column({ name: 'order_id', type: 'varchar', length: 36 })
  orderId!: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order!: Relation<Order>;

  @Index('idx_payments_buyer_id')
  @Column({ name: 'buyer_id', type: 'varchar', length: 36 })
  buyerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: Relation<User>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, default: 'PayPal' })
  paymentMethod!: string;

  @Column({ name: 'payment_status', type: 'varchar', length: 50, default: PaymentStatus.Pending })
  paymentStatus!: PaymentStatus;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  transactionId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
