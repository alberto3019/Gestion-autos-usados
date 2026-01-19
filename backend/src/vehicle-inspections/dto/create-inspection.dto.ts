import { IsString, IsDateString, IsOptional, IsObject, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InspectionDataDto } from './inspection-data.dto';

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

  @ValidateNested()
  @Type(() => InspectionDataDto)
  @IsOptional()
  data?: InspectionDataDto;

  // Backward compatibility: also accept Record<string, any>
  @IsObject()
  @IsOptional()
  dataRaw?: Record<string, any>;
}

