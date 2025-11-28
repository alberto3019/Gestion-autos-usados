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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('agency')
  @Roles('agency_admin')
  async getAgencyUsers(@Request() req) {
    return this.usersService.getAgencyUsers(req.user.agencyId);
  }

  @Post()
  @Roles('agency_admin')
  async createUser(@Request() req, @Body() dto: CreateUserDto) {
    return this.usersService.createUser(req.user.agencyId, dto);
  }

  @Patch(':id')
  @Roles('agency_admin')
  async updateUser(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, req.user.agencyId, dto);
  }

  @Delete(':id')
  @Roles('agency_admin')
  async deleteUser(@Request() req, @Param('id') id: string) {
    return this.usersService.deleteUser(id, req.user.agencyId);
  }
}

