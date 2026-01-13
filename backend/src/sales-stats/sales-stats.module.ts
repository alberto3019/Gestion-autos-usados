import { Module } from '@nestjs/common';
import { SalesStatsController } from './sales-stats.controller';
import { SalesStatsService } from './sales-stats.service';
import { UserPermissionsModule } from '../user-permissions/user-permissions.module';
import { BalancesModule } from '../balances/balances.module';

@Module({
  imports: [UserPermissionsModule, BalancesModule],
  controllers: [SalesStatsController],
  providers: [SalesStatsService],
  exports: [SalesStatsService],
})
export class SalesStatsModule {}

