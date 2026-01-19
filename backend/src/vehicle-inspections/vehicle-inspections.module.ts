import { Module } from '@nestjs/common';
import { VehicleInspectionsController } from './vehicle-inspections.controller';
import { VehicleInspectionsService } from './vehicle-inspections.service';
import { PdfGenerationService } from './pdf-generation.service';
import { UserPermissionsModule } from '../user-permissions/user-permissions.module';

@Module({
  imports: [UserPermissionsModule],
  controllers: [VehicleInspectionsController],
  providers: [VehicleInspectionsService, PdfGenerationService],
  exports: [VehicleInspectionsService],
})
export class VehicleInspectionsModule {}

