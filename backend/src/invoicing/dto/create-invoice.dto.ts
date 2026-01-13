import {
  IsEnum,
  IsInt,
  IsString,
  IsDecimal,
  IsArray,
  IsObject,
  IsOptional,
} from 'class-validator';
import { InvoiceType, Currency } from '@prisma/client';

export class CreateInvoiceDto {
  @IsEnum(InvoiceType)
  type: InvoiceType;

  @IsInt()
  pointOfSale: number;

  @IsString()
  clientName: string;

  @IsString()
  clientTaxId: string;

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
}

