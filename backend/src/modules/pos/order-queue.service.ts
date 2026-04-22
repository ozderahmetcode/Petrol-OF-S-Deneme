import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderQueueService {
  private queue: any[] = [];

  async addToQueue(order: any) {
    console.log(`[OrderQueue] Adding Order ${order.id} to Background Processing Queue...`);
    this.queue.push(order);
    
    // Simulate async background processing (RabbitMQ/BullMQ style)
    this.processQueue();
  }

  private async processQueue() {
    if (this.queue.length === 0) return;

    const order = this.queue.shift();
    console.log(`[Background Worker] Processing Accounting & Inventory for Order ${order.id}...`);
    
    // Simulate DB updates, stock deduction, and external ERP sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`[Background Worker] Order ${order.id} successfully synchronized with Central PO Servers.`);
  }
}
