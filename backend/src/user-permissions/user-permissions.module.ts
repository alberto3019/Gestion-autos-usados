import { Module } from '@nestjs/common';
import { UserPermissionsController } from './user-permissions.controller';
import { UserPermissionsService } from './user-permissions.service';
import { ModulePermissionGuard } from './guards/module-permission.guard';

@Module({
  controllers: [UserPermissionsController],
  providers: [UserPermissionsService, ModulePermissionGuard],
  exports: [UserPermissionsService, ModulePermissionGuard],
})
export class UserPermissionsModule {}

