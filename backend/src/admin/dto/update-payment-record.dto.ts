import { IsOptional, IsNumber, IsString, IsBoolean, IsDateString } from 'class-validator';

export class UpdatePaymentRecordDto {
  @IsOptional()
  @IsNumber()
  extraAmount?: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

