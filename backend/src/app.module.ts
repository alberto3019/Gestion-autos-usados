import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AgenciesModule } from './agencies/agencies.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AdminModule } from './admin/admin.module';
import { WhatsappLogsModule } from './whatsapp-logs/whatsapp-logs.module';
import { UsersModule } from './users/users.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { EmailModule } from './email/email.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UserPermissionsModule } from './user-permissions/user-permissions.module';
import { StockModule } from './stock/stock.module';
import { VehicleInspectionsModule } from './vehicle-inspections/vehicle-inspections.module';
import { ClientsModule } from './clients/clients.module';
import { CashflowModule } from './cashflow/cashflow.module';
import { SalesStatsModule } from './sales-stats/sales-stats.module';
import { FinancingModule } from './financing/financing.module';
import { BalancesModule } from './balances/balances.module';
import { InvoicingModule } from './invoicing/invoicing.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    AgenciesModule,
    VehiclesModule,
    FavoritesModule,
    AdminModule,
    WhatsappLogsModule,
    UsersModule,
    ActivityLogsModule,
    ExchangeRateModule,
    EmailModule,
    UploadModule,
    NotificationsModule,
    SubscriptionsModule,
    UserPermissionsModule,
    StockModule,
    VehicleInspectionsModule,
    ClientsModule,
    CashflowModule,
    SalesStatsModule,
    FinancingModule,
    BalancesModule,
    InvoicingModule,
    MetricsModule,
  ],
})
export class AppModule {}

