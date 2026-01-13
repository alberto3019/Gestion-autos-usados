import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePermissionDto {
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

