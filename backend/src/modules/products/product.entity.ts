import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../shared/base/base.entity.ts';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ length: 255 })
  name!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  price!: number;

  @Column('int', { default: 0 })
  stock!: number;

  @Column({ nullable: true })
  category_id!: string;

  @Column({ nullable: true })
  image!: string;

  @Column({ nullable: true })
  seller_id!: string;
}
