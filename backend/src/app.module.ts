import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { PosModule } from './modules/pos/pos.module';
import { FinanceModule } from './modules/finance/finance.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OperationsModule } from './modules/operations/operations.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: 'database.sqlite',
        autoLoadEntities: true,
        synchronize: true, // Geliştirme için açık
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    PosModule,
    FinanceModule,
    InventoryModule,
    OperationsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
