import { IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class UpdateSubscriptionDto {
  @IsEnum(SubscriptionPlan)
  @IsOptional()
  plan?: SubscriptionPlan;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

