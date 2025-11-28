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
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get('mine')
  @Roles('agency_admin', 'agency_user')
  async getMyVehicles(@Request() req, @Query() query: any) {
    return this.vehiclesService.getMyVehicles(
      req.user.agencyId,
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 20,
      query,
    );
  }

  @Post()
  @Roles('agency_admin', 'agency_user')
  async createVehicle(@Request() req, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.createVehicle(req.user.agencyId, req.user.sub, dto);
  }

  @Get('search')
  async searchVehicles(@Request() req, @Query() dto: SearchVehiclesDto) {
    return this.vehiclesService.searchVehicles(dto, req.user.sub);
  }

  @Get('export')
  @Roles('agency_admin', 'agency_user')
  async exportVehicles(@Request() req, @Res() res: Response) {
    const buffer = await this.vehiclesService.exportVehicles(
      req.user.agencyId,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="vehiculos_${new Date().toISOString().split('T')[0]}.xlsx"`,
    );

    return res.send(buffer);
  }

  @Get(':id')
  async getVehicleById(@Request() req, @Param('id') id: string) {
    return this.vehiclesService.getVehicleById(id, req.user.sub);
  }

  @Patch(':id')
  @Roles('agency_admin', 'agency_user')
  async updateVehicle(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.updateVehicle(id, req.user.agencyId, req.user.sub, dto);
  }

  @Patch('bulk/status')
  @Roles('agency_admin', 'agency_user')
  async bulkUpdateStatus(
    @Request() req,
    @Body() dto: BulkUpdateStatusDto,
  ) {
    return this.vehiclesService.bulkUpdateStatus(
      req.user.agencyId,
      req.user.sub,
      dto,
    );
  }

  @Post('bulk/delete')
  @Roles('agency_admin')
  async bulkDelete(@Request() req, @Body() dto: BulkDeleteDto) {
    return this.vehiclesService.bulkDelete(
      req.user.agencyId,
      req.user.sub,
      dto,
    );
  }

  @Post('import')
  @Roles('agency_admin', 'agency_user')
  @UseInterceptors(FileInterceptor('file'))
  async importVehicles(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (
      !file.mimetype.includes('spreadsheet') &&
      !file.mimetype.includes('excel') &&
      !file.originalname.endsWith('.xlsx') &&
      !file.originalname.endsWith('.xls')
    ) {
      throw new BadRequestException('El archivo debe ser un Excel (.xlsx o .xls)');
    }

    return this.vehiclesService.importVehicles(
      req.user.agencyId,
      req.user.sub,
      file,
    );
  }

  @Patch(':id/status')
  @Roles('agency_admin', 'agency_user')
  async updateVehicleStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.vehiclesService.updateVehicleStatus(
      id,
      req.user.agencyId,
      req.user.sub,
      dto,
    );
  }

  @Delete(':id')
  @Roles('agency_admin')
  async deleteVehicle(@Request() req, @Param('id') id: string) {
    return this.vehiclesService.deleteVehicle(id, req.user.agencyId, req.user.sub);
  }
}

