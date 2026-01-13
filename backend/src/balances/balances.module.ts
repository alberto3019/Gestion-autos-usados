import { Module } from '@nestjs/common';
import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';
import { UserPermissionsModule } from '../user-permissions/user-permissions.module';

@Module({
  imports: [UserPermissionsModule],
  controllers: [BalancesController],
  providers: [BalancesService],
  exports: [BalancesService],
})
export class BalancesModule {}

