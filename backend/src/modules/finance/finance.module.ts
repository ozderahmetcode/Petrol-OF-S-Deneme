import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { ReportsService } from './reports.service';

@Module({
  providers: [FinanceService, ReportsService],
  exports: [FinanceService, ReportsService],
})
export class FinanceModule {}
