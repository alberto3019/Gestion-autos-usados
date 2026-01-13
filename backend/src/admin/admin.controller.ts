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
}

