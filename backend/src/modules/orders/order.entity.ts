import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from '../customer/customer.entity.js';

@Entity('orders')
export class Order {
    @PrimaryColumn({ type: 'varchar', length: 36 })
    id!: string;

    @Column({ name: 'customer_id', type: 'varchar', length: 36 })
    customerId!: string;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer!: Customer;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    total!: number;

    @Column({ type: 'varchar', length: 50, default: 'pending' })
    status!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}
