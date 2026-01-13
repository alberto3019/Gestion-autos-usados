import {
  IsEnum,
  IsDecimal,
  IsDateString,
  IsString,
  IsOptional,
} from 'class-validator';
import { TransactionType, TransactionCategory, Currency } from '@prisma/client';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(TransactionCategory)
  category: TransactionCategory;

  @IsDecimal()
  amount: string;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  vehicleId?: string;
}

