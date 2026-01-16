import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseEnumPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BlockAgencyDto } from './dto/block-agency.dto';
import { ResetAgencyPasswordDto } from './dto/reset-agency-password.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto';
import { UpdatePaymentRecordDto } from './dto/update-payment-record.dto';
import { GeneratePaymentRecordsDto } from './dto/generate-payment-records.dto';
import { ManagementModule } from '@prisma/client';

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

  @Patch('agencies/:id/reset-password')
  async resetAgencyPassword(
    @Param('id') id: string,
    @Body() dto: ResetAgencyPasswordDto,
  ) {
    return this.adminService.resetAgencyPassword(id, dto.newPassword);
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('stats/advanced')
  async getAdvancedStats() {
    return this.adminService.getAdvancedStats();
  }

  @Get('users/last-login')
  async getUsersWithLastLogin() {
    return this.adminService.getUsersWithLastLogin();
  }

  @Patch('agencies/:id/subscription')
  async updateAgencySubscription(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
    @Request() req,
  ) {
    return this.adminService.updateAgencySubscription(
      id,
      dto.plan,
      req.user.id,
    );
  }

  @Get('agencies/:id/modules')
  async getAgencyModules(@Param('id') id: string) {
    return this.adminService.getAgencyModules(id);
  }

  @Post('agencies/:id/modules/:module/enable')
  async enableModule(
    @Param('id') id: string,
    @Param('module', new ParseEnumPipe(ManagementModule))
    module: ManagementModule,
    @Request() req,
  ) {
    return this.adminService.enableModule(id, module, req.user.id);
  }

  @Post('agencies/:id/modules/:module/disable')
  async disableModule(
    @Param('id') id: string,
    @Param('module', new ParseEnumPipe(ManagementModule))
    module: ManagementModule,
    @Request() req,
  ) {
    return this.adminService.disableModule(id, module, req.user.id);
  }

  // Payment Management Endpoints

  @Get('payments/agencies')
  async getAgenciesWithPayments(@Query() query: any) {
    return this.adminService.getAgenciesWithPayments(
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 20,
      {
        month: query.month ? parseInt(query.month) : undefined,
        year: query.year ? parseInt(query.year) : undefined,
        isPaid: query.isPaid !== undefined ? query.isPaid === 'true' : undefined,
        paymentMethod: query.paymentMethod,
        search: query.search,
      },
    );
  }

  @Get('payments/agencies/:id')
  async getAgencyPaymentDetails(@Param('id') id: string) {
    return this.adminService.getAgencyPaymentDetails(id);
  }

  @Get('payments/records')
  async getPaymentRecords(@Query() query: any) {
    return this.adminService.getPaymentRecords({
      agencyId: query.agencyId,
      month: query.month ? parseInt(query.month) : undefined,
      year: query.year ? parseInt(query.year) : undefined,
      isPaid: query.isPaid !== undefined ? query.isPaid === 'true' : undefined,
    });
  }

  @Post('payments/records')
  async createOrUpdatePaymentRecord(
    @Body() dto: CreatePaymentRecordDto,
    @Request() req,
  ) {
    return this.adminService.createOrUpdatePaymentRecord(dto, req.user.id);
  }

  @Patch('payments/records/:id')
  async updatePaymentRecord(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentRecordDto,
    @Request() req,
  ) {
    return this.adminService.updatePaymentRecord(id, dto, req.user.id);
  }

  @Post('payments/records/generate-month')
  async generatePaymentRecordsForMonth(
    @Body() dto: GeneratePaymentRecordsDto,
    @Request() req,
  ) {
    return this.adminService.generatePaymentRecordsForMonth(
      dto.month,
      dto.year,
      req.user.id,
    );
  }

  @Get('payments/alerts')
  async getPaymentAlerts() {
    return this.adminService.getPaymentAlerts();
  }
}

