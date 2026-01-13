import { Module } from '@nestjs/common';
import { FinancingController } from './financing.controller';
import { FinancingService } from './financing.service';
import { UserPermissionsModule } from '../user-permissions/user-permissions.module';

@Module({
  imports: [UserPermissionsModule],
  controllers: [FinancingController],
  providers: [FinancingService],
  exports: [FinancingService],
})
export class FinancingModule {}

