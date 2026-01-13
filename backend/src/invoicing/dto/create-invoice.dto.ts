import {
  IsEnum,
  IsInt,
  IsString,
  IsDecimal,
  IsArray,
  IsObject,
  IsOptional,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { InvoiceType, Currency } from '@prisma/client';

export class CreateInvoiceDto {
  @IsEnum(InvoiceType)
  type: InvoiceType;

  @IsInt()
  @IsOptional()
  pointOfSale?: number;

  @IsString()
  clientName: string;

  @IsString()
  clientTaxId: string;

  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @IsString()
  @IsOptional()
  clientPhone?: string;

  @IsString()
  @IsOptional()
  clientAddress?: string;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsObject({ each: true })
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsString()
  @IsOptional()
  vehicleId?: string;
}

