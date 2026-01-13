import { IsString, IsDateString, IsOptional, IsDecimal } from 'class-validator';

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

  @IsDateString()
  saleDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

