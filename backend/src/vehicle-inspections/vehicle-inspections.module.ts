import { Module } from '@nestjs/common';
import { VehicleInspectionsController } from './vehicle-inspections.controller';
import { VehicleInspectionsService } from './vehicle-inspections.service';
import { UserPermissionsModule } from '../user-permissions/user-permissions.module';

@Module({
  imports: [UserPermissionsModule],
  controllers: [VehicleInspectionsController],
  providers: [VehicleInspectionsService],
  exports: [VehicleInspectionsService],
})
export class VehicleInspectionsModule {}

