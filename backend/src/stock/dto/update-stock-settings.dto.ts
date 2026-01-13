import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateStockSettingsDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  stockYellowDays?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  stockRedDays?: number;
}

