import { IsEnum, IsNotEmpty } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(VehicleStatus)
  @IsNotEmpty()
  status: VehicleStatus;
}

