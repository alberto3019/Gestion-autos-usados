import { Module } from '@nestjs/common';
import { CashflowController } from './cashflow.controller';
import { CashflowService } from './cashflow.service';
import { UserPermissionsModule } from '../user-permissions/user-permissions.module';
import { BalancesModule } from '../balances/balances.module';
import { SalesStatsModule } from '../sales-stats/sales-stats.module';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';

@Module({
  imports: [UserPermissionsModule, BalancesModule, SalesStatsModule, ExchangeRateModule],
  controllers: [CashflowController],
  providers: [CashflowService],
  exports: [CashflowService],
})
export class CashflowModule {}

