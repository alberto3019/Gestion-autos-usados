import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BlockAgencyDto } from './dto/block-agency.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('agencies')
  async getAgencies(@Query() query: any) {
    return this.adminService.getAgencies(
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 20,
      query.status,
    );
  }

  @Patch('agencies/:id/approve')
  async approveAgency(@Param('id') id: string) {
    return this.adminService.approveAgency(id);
  }

  @Patch('agencies/:id/block')
  async blockAgency(@Param('id') id: string, @Body() dto: BlockAgencyDto) {
    return this.adminService.blockAgency(id, dto.reason);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('stats/advanced')
  async getAdvancedStats() {
    return this.adminService.getAdvancedStats();
  }
}

