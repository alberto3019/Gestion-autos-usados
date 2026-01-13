import { IsEnum } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class UpdateSubscriptionDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}

