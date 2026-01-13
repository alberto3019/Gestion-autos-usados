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
import { InvoicingService } from './invoicing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ModulePermissionGuard,
  RequireModulePermission,
} from '../user-permissions/guards/module-permission.guard';
import { ManagementModule, InvoiceType } from '@prisma/client';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoicing')
@UseGuards(JwtAuthGuard, RolesGuard, ModulePermissionGuard)
export class InvoicingController {
  constructor(private invoicingService: InvoicingService) {}

  @Get('afip-settings')
  @RequireModulePermission(ManagementModule.invoicing_afip)
  @Roles('agency_admin')
  async getAfipSettings(@Request() req) {
    return this.invoicingService.getAgencyAfipSettings(req.user.agencyId);
  }

  @Get('sold-vehicles')
  @RequireModulePermission(ManagementModule.invoicing_afip)
  @Roles('agency_admin', 'agency_user')
  async getSoldVehicles(@Request() req) {
    return this.invoicingService.getSoldVehicles(req.user.agencyId);
  }

  @Patch('afip-settings')
  @RequireModulePermission(ManagementModule.invoicing_afip)
  @Roles('agency_admin')
  async updateAfipSettings(
    @Request() req,
    @Body()
    data: {
      afipCuit?: string;
      afipPointOfSale?: number;
      afipCertificate?: string;
      afipPrivateKey?: string;
    },
  ) {
    return this.invoicingService.updateAgencyAfipSettings(
      req.user.agencyId,
      data,
    );
  }

  @Post()
  @RequireModulePermission(ManagementModule.invoicing_afip)
  @Roles('agency_admin', 'agency_user')
  async createInvoice(@Request() req, @Body() dto: CreateInvoiceDto) {
    return this.invoicingService.createInvoice(req.user.agencyId, dto);
  }

  @Get()
  @RequireModulePermission(ManagementModule.invoicing_afip)
  @Roles('agency_admin', 'agency_user')
  async getInvoices(
    @Request() req,
    @Query('status') status?: string,
    @Query('type') type?: InvoiceType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoicingService.getInvoices(
      req.user.agencyId,
      status,
      type,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get(':id')
  @RequireModulePermission(ManagementModule.invoicing_afip)
  @Roles('agency_admin', 'agency_user')
  async getInvoice(@Request() req, @Param('id') id: string) {
    return this.invoicingService.getInvoice(id, req.user.agencyId);
  }

  @Delete(':id')
  @RequireModulePermission(ManagementModule.invoicing_afip)
  @Roles('agency_admin')
  async deleteInvoice(@Request() req, @Param('id') id: string) {
    return this.invoicingService.deleteInvoice(id, req.user.agencyId);
  }
}

