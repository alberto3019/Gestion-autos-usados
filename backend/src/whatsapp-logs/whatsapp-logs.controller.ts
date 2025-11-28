import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WhatsappLogsService } from './whatsapp-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogWhatsappClickDto } from './dto/log-whatsapp-click.dto';

@Controller('whatsapp-logs')
@UseGuards(JwtAuthGuard)
export class WhatsappLogsController {
  constructor(private whatsappLogsService: WhatsappLogsService) {}

  @Post()
  async logWhatsappClick(@Request() req, @Body() dto: LogWhatsappClickDto) {
    return this.whatsappLogsService.logWhatsappClick(
      req.user.sub,
      dto.vehicleId,
    );
  }
}

