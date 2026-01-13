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
import { CashflowService } from './cashflow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ModulePermissionGuard,
  RequireModulePermission,
} from '../user-permissions/guards/module-permission.guard';
import { ManagementModule, TransactionType, TransactionCategory } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('cashflow')
@UseGuards(JwtAuthGuard, RolesGuard, ModulePermissionGuard)
export class CashflowController {
  constructor(private cashflowService: CashflowService) {}

  @Post()
  @RequireModulePermission(ManagementModule.cashflow)
  @Roles('agency_admin', 'agency_user')
  async createTransaction(@Request() req, @Body() dto: CreateTransactionDto) {
    return this.cashflowService.createTransaction(req.user.agencyId, dto);
  }

  @Get()
  @RequireModulePermission(ManagementModule.cashflow)
  @Roles('agency_admin', 'agency_user')
  async getTransactions(
    @Request() req,
    @Query('type') type?: TransactionType,
    @Query('category') category?: TransactionCategory,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cashflowService.getTransactions(
      req.user.agencyId,
      type,
      category,
      startDate,
      endDate,
      vehicleId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get('report')
  @RequireModulePermission(ManagementModule.cashflow)
  @Roles('agency_admin', 'agency_user')
  async getCashflowReport(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.cashflowService.getCashflowReport(
      req.user.agencyId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @RequireModulePermission(ManagementModule.cashflow)
  @Roles('agency_admin', 'agency_user')
  async getTransaction(@Request() req, @Param('id') id: string) {
    return this.cashflowService.getTransaction(id, req.user.agencyId);
  }

  @Patch(':id')
  @RequireModulePermission(ManagementModule.cashflow)
  @Roles('agency_admin', 'agency_user')
  async updateTransaction(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: Partial<CreateTransactionDto>,
  ) {
    return this.cashflowService.updateTransaction(id, req.user.agencyId, dto);
  }

  @Delete(':id')
  @RequireModulePermission(ManagementModule.cashflow)
  @Roles('agency_admin')
  async deleteTransaction(@Request() req, @Param('id') id: string) {
    return this.cashflowService.deleteTransaction(id, req.user.agencyId);
  }
}

