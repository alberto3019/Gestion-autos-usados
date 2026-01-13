import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ManagementModule } from '@prisma/client';

export class CreatePermissionDto {
  @IsEnum(ManagementModule)
  module: ManagementModule;

  @IsBoolean()
  @IsOptional()
  canView?: boolean;

  @IsBoolean()
  @IsOptional()
  canEdit?: boolean;

  @IsBoolean()
  @IsOptional()
  canDelete?: boolean;
}

