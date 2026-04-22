import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendAlert(message: string, type: 'CRITICAL' | 'WARNING' | 'INFO') {
    console.log(`[Notification] ${type}: ${message}`);
    // Future: Push to WebSocket or SMS/Email
  }
}
