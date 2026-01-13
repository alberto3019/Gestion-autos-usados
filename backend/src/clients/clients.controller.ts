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
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ModulePermissionGuard,
  RequireModulePermission,
} from '../user-permissions/guards/module-permission.guard';
import { ManagementModule } from '@prisma/client';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard, ModulePermissionGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  @RequireModulePermission(ManagementModule.clients)
  @Roles('agency_admin', 'agency_user')
  async createClient(@Request() req, @Body() dto: CreateClientDto) {
    return this.clientsService.createClient(req.user.agencyId, dto);
  }

  @Get()
  @RequireModulePermission(ManagementModule.clients)
  @Roles('agency_admin', 'agency_user')
  async getClients(
    @Request() req,
    @Query('search') search?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.clientsService.getClients(
      req.user.agencyId,
      search,
      vehicleId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('alerts')
  @RequireModulePermission(ManagementModule.clients)
  @Roles('agency_admin', 'agency_user')
  async getClientsWithAlerts(@Request() req) {
    return this.clientsService.getClientsWithAlerts(req.user.agencyId);
  }

  @Get(':id')
  @RequireModulePermission(ManagementModule.clients)
  @Roles('agency_admin', 'agency_user')
  async getClient(@Request() req, @Param('id') id: string) {
    return this.clientsService.getClient(id, req.user.agencyId);
  }

  @Patch(':id')
  @RequireModulePermission(ManagementModule.clients)
  @Roles('agency_admin', 'agency_user')
  async updateClient(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreateClientDto>,
  ) {
    return this.clientsService.updateClient(id, req.user.agencyId, dto);
  }

  @Delete(':id')
  @RequireModulePermission(ManagementModule.clients)
  @Roles('agency_admin')
  async deleteClient(@Request() req, @Param('id') id: string) {
    return this.clientsService.deleteClient(id, req.user.agencyId);
  }
}

