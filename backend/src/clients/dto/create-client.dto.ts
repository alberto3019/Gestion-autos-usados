import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  documentType?: string;

  @IsString()
  @IsOptional()
  documentNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  currentVehicleId?: string;

  @IsString()
  @IsOptional()
  desiredVehicleId?: string;

  @IsBoolean()
  @IsOptional()
  alertEnabled?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  alertDays?: number;
}

