import { Module } from '@nestjs/common';
import { SalesStatsController } from './sales-stats.controller';
import { SalesStatsService } from './sales-stats.service';
import { UserPermissionsModule } from '../user-permissions/user-permissions.module';

@Module({
  imports: [UserPermissionsModule],
  controllers: [SalesStatsController],
  providers: [SalesStatsService],
  exports: [SalesStatsService],
})
export class SalesStatsModule {}

