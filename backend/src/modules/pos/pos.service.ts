import { Injectable } from '@nestjs/common';

export interface PaymentRequest {
  orderId: string;
  type: 'CASH' | 'CREDIT_CARD' | 'LOGISTICS';
  amount: number;
}

@Injectable()
export class PosService {
  async processPayment(payment: PaymentRequest) {
    let netAmount = payment.amount;
    let feeAmount = 0;

    // Special Business Rule: Lojistik Kart (Lojistik İskontosu)
    // 2000 TL total -> 1940 TL credit + 60 TL fee (example 3% discount)
    if (payment.type === 'LOGISTICS') {
      const discountRate = 0.03; // Example rate, could be dynamic per carrier
      feeAmount = payment.amount * discountRate;
      netAmount = payment.amount - feeAmount;
      
      console.log(`Logistics Payment Processed: Total ${payment.amount}, Net ${netAmount}, Discount ${feeAmount}`);
    }

    return {
      status: 'SUCCESS',
      transactionId: Math.random().toString(36).substr(2, 9),
      netAmount,
      feeAmount,
    };
  }

  // Conditional Discount Rule: >1500 TL -> 5% off
  calculateTotal(grossAmount: number) {
    let discount = 0;
    if (grossAmount > 1500) {
      discount = grossAmount * 0.05;
    }
    return {
      gross: grossAmount,
      discount,
      net: grossAmount - discount,
    };
  }
}
