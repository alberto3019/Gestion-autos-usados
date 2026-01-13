import { Module } from '@nestjs/common';
import { InvoicingController } from './invoicing.controller';
import { InvoicingService } from './invoicing.service';
import { UserPermissionsModule } from '../user-permissions/user-permissions.module';
import { BalancesModule } from '../balances/balances.module';

@Module({
  imports: [UserPermissionsModule, BalancesModule],
  controllers: [InvoicingController],
  providers: [InvoicingService],
  exports: [InvoicingService],
})
export class InvoicingModule {}

