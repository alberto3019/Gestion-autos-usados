import {
  IsString,
  IsDecimal,
  IsInt,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';

export class CreateFinancingDto {
  @IsString()
  vehicleId: string;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  financier: string;

  @IsDecimal()
  amount: string;

  @IsInt()
  installments: number;

  @IsDecimal()
  @IsOptional()
  interestRate?: string;

  @IsEnum(['pending', 'approved', 'rejected', 'completed'])
  status: string;

  @IsDateString()
  applicationDate: string;

  @IsDateString()
  @IsOptional()
  approvalDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

