import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Batch } from './entities/batch.entity';

interface InventoryAlert {
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  msg: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
  ) {}

  // 3-7-15 Rule: Check expiry dates and generate alerts
  async checkExpiryAlerts(batches: Batch[]): Promise<InventoryAlert[]> {
    const today = new Date();
    const alerts: InventoryAlert[] = [];

    batches.forEach(batch => {
      if (!batch.expiry_date) return;
      
      const expiry = new Date(batch.expiry_date);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const productName = batch.product ? batch.product.name : 'Bilinmeyen Ürün';

      if (diffDays === 3) alerts.push({ type: 'CRITICAL', msg: `3 gün kaldı: ${productName}` });
      else if (diffDays === 7) alerts.push({ type: 'WARNING', msg: `7 gün kaldı: ${productName}` });
      else if (diffDays === 15) alerts.push({ type: 'INFO', msg: `15 gün kaldı: ${productName}` });
    });

    return alerts;
  }

  // Bulk Import placeholder
  async bulkImportInvoices(fileData: any) {
    // Logic to parse CSV/XML and create batches without scanning
    console.log('Processing bulk import for inventory...');
    return { importedCount: 150, status: 'COMPLETED' };
  }
}
