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
import { FinancingService } from './financing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ModulePermissionGuard,
  RequireModulePermission,
} from '../user-permissions/guards/module-permission.guard';
import { ManagementModule } from '@prisma/client';
import { CreateFinancingDto } from './dto/create-financing.dto';

@Controller('financing')
@UseGuards(JwtAuthGuard, RolesGuard, ModulePermissionGuard)
export class FinancingController {
  constructor(private financingService: FinancingService) {}

  @Post()
  @RequireModulePermission(ManagementModule.financing_tracking)
  @Roles('agency_admin', 'agency_user')
  async createFinancing(@Request() req, @Body() dto: CreateFinancingDto) {
    return this.financingService.createFinancing(req.user.agencyId, dto);
  }

  @Get()
  @RequireModulePermission(ManagementModule.financing_tracking)
  @Roles('agency_admin', 'agency_user')
  async getFinancings(
    @Request() req,
    @Query('status') status?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('clientId') clientId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.financingService.getFinancings(
      req.user.agencyId,
      status,
      vehicleId,
      clientId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get(':id')
  @RequireModulePermission(ManagementModule.financing_tracking)
  @Roles('agency_admin', 'agency_user')
  async getFinancing(@Request() req, @Param('id') id: string) {
    return this.financingService.getFinancing(id, req.user.agencyId);
  }

  @Patch(':id')
  @RequireModulePermission(ManagementModule.financing_tracking)
  @Roles('agency_admin', 'agency_user')
  async updateFinancing(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreateFinancingDto>,
  ) {
    return this.financingService.updateFinancing(id, req.user.agencyId, dto);
  }

  @Delete(':id')
  @RequireModulePermission(ManagementModule.financing_tracking)
  @Roles('agency_admin')
  async deleteFinancing(@Request() req, @Param('id') id: string) {
    return this.financingService.deleteFinancing(id, req.user.agencyId);
  }
}

