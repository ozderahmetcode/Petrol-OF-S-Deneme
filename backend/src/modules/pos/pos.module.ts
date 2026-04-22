import { Module } from '@nestjs/common';
import { PosService } from './pos.service';
import { PumpGateway } from './pump.gateway';
import { OrderQueueService } from './order-queue.service';

@Module({
  providers: [PosService, PumpGateway, OrderQueueService],
  exports: [PosService],
})
export class PosModule {}
