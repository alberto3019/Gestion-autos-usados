import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ModulePermissionGuard,
  RequireModulePermission,
} from '../user-permissions/guards/module-permission.guard';
import { ManagementModule } from '@prisma/client';

@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard, ModulePermissionGuard)
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  @RequireModulePermission(ManagementModule.metrics)
  @Roles('agency_admin', 'agency_user')
  async getMetrics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('sellerId') sellerId?: string,
  ) {
    return this.metricsService.getMetrics(
      req.user.agencyId,
      startDate,
      endDate,
      vehicleId,
      sellerId,
    );
  }
}

