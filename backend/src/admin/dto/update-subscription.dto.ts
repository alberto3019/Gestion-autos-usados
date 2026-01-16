import { IsEnum, IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class UpdateSubscriptionDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  billingDay?: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

