import { IsOptional, IsString } from 'class-validator';

export class BlockAgencyDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

