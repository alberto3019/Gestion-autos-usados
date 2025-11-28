import { Module } from '@nestjs/common';
import { WhatsappLogsController } from './whatsapp-logs.controller';
import { WhatsappLogsService } from './whatsapp-logs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [PrismaModule, ActivityLogsModule],
  controllers: [WhatsappLogsController],
  providers: [WhatsappLogsService],
})
export class WhatsappLogsModule {}

