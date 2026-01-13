import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VehicleInspectionsService } from './vehicle-inspections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ModulePermissionGuard,
  RequireModulePermission,
} from '../user-permissions/guards/module-permission.guard';
import { ManagementModule } from '@prisma/client';
import { CreateInspectionDto } from './dto/create-inspection.dto';

@Controller('vehicle-inspections')
@UseGuards(JwtAuthGuard, RolesGuard, ModulePermissionGuard)
export class VehicleInspectionsController {
  constructor(
    private vehicleInspectionsService: VehicleInspectionsService,
  ) {}

  @Post()
  @RequireModulePermission(ManagementModule.vehicle_inspection)
  @Roles('agency_admin', 'agency_user')
  async createInspection(@Request() req, @Body() dto: CreateInspectionDto) {
    return this.vehicleInspectionsService.createInspection(
      req.user.agencyId,
      dto,
    );
  }

  @Get()
  @RequireModulePermission(ManagementModule.vehicle_inspection)
  @Roles('agency_admin', 'agency_user')
  async getInspections(
    @Request() req,
    @Query('vehicleId') vehicleId?: string,
  ) {
    return this.vehicleInspectionsService.getInspections(
      req.user.agencyId,
      vehicleId,
    );
  }

  @Get(':id')
  @RequireModulePermission(ManagementModule.vehicle_inspection)
  @Roles('agency_admin', 'agency_user')
  async getInspection(@Request() req, @Param('id') id: string) {
    return this.vehicleInspectionsService.getInspection(id, req.user.agencyId);
  }

  @Patch(':id')
  @RequireModulePermission(ManagementModule.vehicle_inspection)
  @Roles('agency_admin')
  async updateInspection(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreateInspectionDto>,
  ) {
    return this.vehicleInspectionsService.updateInspection(
      id,
      req.user.agencyId,
      dto,
    );
  }

  @Delete(':id')
  @RequireModulePermission(ManagementModule.vehicle_inspection)
  @Roles('agency_admin')
  async deleteInspection(@Request() req, @Param('id') id: string) {
    return this.vehicleInspectionsService.deleteInspection(
      id,
      req.user.agencyId,
    );
  }
}

