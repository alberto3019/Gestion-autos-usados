import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class BulkUpdateStatusDto {
  @IsArray()
  @IsNotEmpty()
  vehicleIds: string[];

  @IsEnum(VehicleStatus)
  @IsNotEmpty()
  status: VehicleStatus;
}

