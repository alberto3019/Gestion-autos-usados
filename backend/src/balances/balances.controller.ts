import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BalancesService } from './balances.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ModulePermissionGuard,
  RequireModulePermission,
} from '../user-permissions/guards/module-permission.guard';
import { ManagementModule } from '@prisma/client';

@Controller('balances')
@UseGuards(JwtAuthGuard, RolesGuard, ModulePermissionGuard)
export class BalancesController {
  constructor(private balancesService: BalancesService) {}

  @Get()
  @RequireModulePermission(ManagementModule.balances)
  @Roles('agency_admin', 'agency_user')
  async getBalances(
    @Request() req,
    @Query('vehicleId') vehicleId?: string,
  ) {
    return this.balancesService.getBalances(req.user.agencyId, vehicleId);
  }

  @Get('report')
  @RequireModulePermission(ManagementModule.balances)
  @Roles('agency_admin', 'agency_user')
  async getBalancesReport(@Request() req) {
    return this.balancesService.getBalancesReport(req.user.agencyId);
  }

  @Get('vehicle/:vehicleId')
  @RequireModulePermission(ManagementModule.balances)
  @Roles('agency_admin', 'agency_user')
  async getVehicleBalance(
    @Request() req,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.balancesService.getVehicleBalance(vehicleId, req.user.agencyId);
  }

  @Patch('vehicle/:vehicleId')
  @RequireModulePermission(ManagementModule.balances)
  @Roles('agency_admin', 'agency_user')
  async updateVehicleBalance(
    @Request() req,
    @Param('vehicleId') vehicleId: string,
    @Body()
    data: {
      purchasePrice?: string;
      investment?: string;
      salePrice?: string;
    },
  ) {
    return this.balancesService.updateVehicleBalance(
      vehicleId,
      req.user.agencyId,
      data,
    );
  }
}

