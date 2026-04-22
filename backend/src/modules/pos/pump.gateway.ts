import { WebSocketGateway, WebSocketServer, OnGatewayInit, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class PumpGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  private pumpStates = Array.from({ length: 8 }, (_, i) => ({
    pumpId: i + 1,
    status: 'IDLE',
    volume: 0,
    amount: 0,
  }));

  @SubscribeMessage('pumps:pay')
  handlePayment(@MessageBody() data: { pumpId: number }) {
    const pumpIndex = this.pumpStates.findIndex(p => p.pumpId === data.pumpId);
    if (pumpIndex !== -1) {
      console.log(`Payment received for Pump ${data.pumpId}. Resetting to IDLE.`);
      this.pumpStates[pumpIndex] = {
        ...this.pumpStates[pumpIndex],
        status: 'IDLE',
        volume: 0,
        amount: 0
      };
    }
  }

  afterInit(server: Server) {
    console.log('Pump Gateway Initialized with Payment Logic');
    
    setInterval(() => {
      this.pumpStates = this.pumpStates.map(pump => {
        const chance = Math.random();
        
        // IDLE -> FILLING (Rare, simulates a customer arriving)
        if (pump.status === 'IDLE' && chance > 0.97) {
          return { ...pump, status: 'FILLING', volume: 0, amount: 0 };
        }
        
        // FILLING -> WAITING_PAYMENT (When tank is full)
        // Transition guaranteed if volume > 50, or random if volume > 30
        if (pump.status === 'FILLING' && (pump.volume > 50 || (pump.volume > 30 && chance > 0.8))) {
          return { ...pump, status: 'WAITING_PAYMENT' };
        }

        // Incremental updates during filling
        if (pump.status === 'FILLING') {
          const newVolume = pump.volume + (Math.random() * 2);
          const newAmount = newVolume * 38.50;
          return { ...pump, volume: newVolume, amount: newAmount };
        }

        return pump;
      });

      // Format for emission
      const formattedPumps = this.pumpStates.map(p => ({
        ...p,
        volume: p.volume.toFixed(2),
        amount: p.amount.toFixed(2)
      }));

      this.server.emit('pumps:update', formattedPumps);
    }, 2000); 
  }
}
