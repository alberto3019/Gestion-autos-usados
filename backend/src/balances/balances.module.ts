import { Module } from '@nestjs/common';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';
import { BalanceHelperService } from './balance-helper.service';
import { UserPermissionsModule } from '../user-permissions/user-permissions.module';

@Module({
  imports: [UserPermissionsModule],
  controllers: [BalancesController],
  providers: [BalancesService, BalanceHelperService],
  exports: [BalancesService, BalanceHelperService],
})
export class BalancesModule {}

