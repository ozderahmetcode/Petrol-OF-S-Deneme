import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Batch, Category])],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
