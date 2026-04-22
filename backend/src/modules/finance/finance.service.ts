import { Injectable } from '@nestjs/common';

@Injectable()
export class FinanceService {
  async reconcileShift(shiftId: string, actualCash: number, actualSlips: number) {
    // In a real app, query database for total orders in this virtual shift
    const expectedAmount = 15450.50; // Mock expected total from orders
    const totalActual = actualCash + actualSlips;
    const difference = totalActual - expectedAmount;

    return {
      shiftId,
      expected: expectedAmount,
      actual: totalActual,
      difference,
      status: Math.abs(difference) < 1 ? 'MATCHED' : 'DISCREPANCY',
      timestamp: new Date()
    };
  }
}
