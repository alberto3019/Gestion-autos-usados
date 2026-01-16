import { IsInt, Min, Max } from 'class-validator';

export class GeneratePaymentRecordsDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  @Max(3000)
  year: number;
}

