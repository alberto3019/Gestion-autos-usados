import { IsString, IsDateString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CreateInspectionDto {
  @IsString()
  vehicleId: string;

  @IsString()
  inspectorName: string;

  @IsDateString()
  inspectionDate: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsEnum(['approved', 'rejected', 'pending'])
  status: string;

  @IsObject()
  data: Record<string, any>;
}

