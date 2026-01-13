import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateStockSettingsDto } from './dto/update-stock-settings.dto';
import {
  ModulePermissionGuard,
  RequireModulePermission,
} from '../user-permissions/guards/module-permission.guard';
import { ManagementModule } from '@prisma/client';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard, ModulePermissionGuard)
export class StockController {
  constructor(private stockService: StockService) {}

  @Get('settings')
  @RequireModulePermission(ManagementModule.stock)
  @Roles('agency_admin', 'agency_user')
  async getStockSettings(@Request() req) {
    return this.stockService.getStockSettings(req.user.agencyId);
  }

  @Patch('settings')
  @RequireModulePermission(ManagementModule.stock)
  @Roles('agency_admin')
  async updateStockSettings(
    @Request() req,
    @Body() dto: UpdateStockSettingsDto,
  ) {
    return this.stockService.updateStockSettings(req.user.agencyId, dto);
  }

  @Get('vehicles')
  @RequireModulePermission(ManagementModule.stock)
  @Roles('agency_admin', 'agency_user')
  async getVehiclesWithStockStatus(
    @Request() req,
    @Query('status') status?: 'green' | 'yellow' | 'red',
  ) {
    return this.stockService.getVehiclesWithStockStatus(
      req.user.agencyId,
      status,
    );
  }

  @Get('statistics')
  @RequireModulePermission(ManagementModule.stock)
  @Roles('agency_admin', 'agency_user')
  async getStockStatistics(@Request() req) {
    return this.stockService.getStockStatistics(req.user.agencyId);
  }
}

