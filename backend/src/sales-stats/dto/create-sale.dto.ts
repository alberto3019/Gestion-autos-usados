import { IsString, IsDateString, IsOptional, IsDecimal, IsEnum } from 'class-validator';
import { Currency } from '@prisma/client';

export class CreateSaleDto {
  @IsString()
  vehicleId: string;

  @IsString()
  sellerId: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsDecimal()
  salePrice: string;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsDateString()
  saleDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

