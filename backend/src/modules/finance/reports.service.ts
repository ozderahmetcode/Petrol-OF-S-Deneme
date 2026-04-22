import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  async getDailySummary() {
    return {
      totalSales: 125400.75,
      fuelVolume: 4250.5, // Liters
      marketRevenue: 12400.25,
      activeStaff: 4,
      topProducts: [
        { name: 'Kurşunsuz 95', sales: 85000 },
        { name: 'Motorin', sales: 32000 },
        { name: 'Su 0.5L', sales: 1200 }
      ],
      hourlyTraffic: [12, 18, 45, 30, 25, 60, 80, 50] // Hourly order counts
    };
  }
}
