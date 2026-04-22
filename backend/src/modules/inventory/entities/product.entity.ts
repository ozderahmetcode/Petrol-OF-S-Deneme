import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'MARKET_GOODS' })
  type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  base_price: number;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @CreateDateColumn()
  created_at: Date;
}
