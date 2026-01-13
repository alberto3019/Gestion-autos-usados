import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SalesStatsService } from './sales-stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ModulePermissionGuard,
  RequireModulePermission,
} from '../user-permissions/guards/module-permission.guard';
import { ManagementModule } from '@prisma/client';
import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('sales-stats')
@UseGuards(JwtAuthGuard, RolesGuard, ModulePermissionGuard)
export class SalesStatsController {
  constructor(private salesStatsService: SalesStatsService) {}

  @Post()
  @RequireModulePermission(ManagementModule.statistics)
  @Roles('agency_admin', 'agency_user')
  async createSale(@Request() req, @Body() dto: CreateSaleDto) {
    return this.salesStatsService.createSale(req.user.agencyId, dto);
  }

  @Get()
  @RequireModulePermission(ManagementModule.statistics)
  @Roles('agency_admin', 'agency_user')
  async getSales(
    @Request() req,
    @Query('sellerId') sellerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesStatsService.getSales(
      req.user.agencyId,
      sellerId,
      startDate,
      endDate,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('ranking')
  @RequireModulePermission(ManagementModule.statistics)
  @Roles('agency_admin', 'agency_user')
  async getSalesRanking(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesStatsService.getSalesRanking(
      req.user.agencyId,
      startDate,
      endDate,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('seller/:sellerId')
  @RequireModulePermission(ManagementModule.statistics)
  @Roles('agency_admin', 'agency_user')
  async getSellerStats(
    @Request() req,
    @Param('sellerId') sellerId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.salesStatsService.getSellerStats(
      req.user.agencyId,
      sellerId,
      startDate,
      endDate,
    );
  }

  @Get('sale/:id')
  @RequireModulePermission(ManagementModule.statistics)
  @Roles('agency_admin', 'agency_user')
  async getSale(@Request() req, @Param('id') id: string) {
    return this.salesStatsService.getSale(id, req.user.agencyId);
  }
}

