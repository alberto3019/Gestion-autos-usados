import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import {
  FuelType,
  Transmission,
  Currency,
  VehicleCondition,
  VehicleStatus,
} from '@prisma/client';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsInt()
  @Min(0)
  kilometers: number;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsEnum(Transmission)
  transmission: Transmission;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  @IsBoolean()
  @IsOptional()
  hideLicensePlate?: boolean;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsEnum(VehicleCondition)
  @IsOptional()
  condition?: VehicleCondition;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @IsString()
  @IsOptional()
  locationCity?: string;

  @IsString()
  @IsOptional()
  locationState?: string;

  @IsString()
  @IsOptional()
  internalNotes?: string;

  @IsString()
  @IsOptional()
  publicNotes?: string;

  @IsArray()
  @IsString({ each: true })
  photos: string[];
}

