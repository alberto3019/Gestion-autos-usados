import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseEnumPipe,
} from '@nestjs/common';
import { UserPermissionsService } from './user-permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ManagementModule } from '@prisma/client';

@Controller('user-permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserPermissionsController {
  constructor(private userPermissionsService: UserPermissionsService) {}

  @Get('me')
  @Roles('agency_admin', 'agency_user')
  async getMyPermissions(@Request() req) {
    return this.userPermissionsService.getUserPermissions(req.user.id);
  }

  @Get('user/:userId')
  @Roles('agency_admin')
  async getUserPermissions(
    @Request() req,
    @Param('userId') userId: string,
  ) {
    // Verify that the user belongs to the same agency
    // This should be added as a validation in the service
    return this.userPermissionsService.getUserPermissions(userId);
  }

  @Post('user/:userId')
  @Roles('agency_admin')
  async createPermission(
    @Request() req,
    @Param('userId') userId: string,
    @Body() dto: CreatePermissionDto,
  ) {
    return this.userPermissionsService.createOrUpdatePermission(
      userId,
      req.user.agencyId,
      dto,
    );
  }

  @Patch('user/:userId/module/:module')
  @Roles('agency_admin')
  async updatePermission(
    @Request() req,
    @Param('userId') userId: string,
    @Param('module', new ParseEnumPipe(ManagementModule)) module: ManagementModule,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.userPermissionsService.updatePermission(userId, module, dto);
  }

  @Delete('user/:userId/module/:module')
  @Roles('agency_admin')
  async deletePermission(
    @Request() req,
    @Param('userId') userId: string,
    @Param('module', new ParseEnumPipe(ManagementModule)) module: ManagementModule,
  ) {
    await this.userPermissionsService.deletePermission(userId, module);
    return { message: 'Permiso eliminado exitosamente' };
  }
}

