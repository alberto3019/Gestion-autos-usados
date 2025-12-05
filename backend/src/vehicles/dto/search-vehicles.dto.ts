import { IsOptional, IsString, IsInt, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FuelType, Transmission, VehicleStatus } from '@prisma/client';

export class SearchVehiclesDto {
  @IsOptional()
  @IsString()
  search?: string; // Búsqueda general en marca, modelo y versión

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  kilometersMax?: number;

  @IsOptional()
  @Type(() => Number)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  priceMax?: number;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @IsOptional()
  @IsString()
  locationState?: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'price' | 'kilometers' | 'year';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

