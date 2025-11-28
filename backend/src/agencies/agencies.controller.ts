import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AgenciesService } from './agencies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateAgencyDto } from './dto/update-agency.dto';

@Controller('agencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgenciesController {
  constructor(private agenciesService: AgenciesService) {}

  @Get('me')
  @Roles('agency_admin', 'agency_user')
  async getMyAgency(@Request() req) {
    return this.agenciesService.getMyAgency(req.user.agencyId);
  }

  @Patch('me')
  @Roles('agency_admin')
  async updateMyAgency(@Request() req, @Body() dto: UpdateAgencyDto) {
    return this.agenciesService.updateMyAgency(req.user.agencyId, dto);
  }
}

