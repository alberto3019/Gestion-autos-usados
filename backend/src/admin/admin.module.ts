import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { EmailModule } from '../email/email.module';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';

@Module({
  imports: [ActivityLogsModule, EmailModule, ExchangeRateModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

