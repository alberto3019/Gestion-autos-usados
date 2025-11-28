import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateAgencyDto {
  @IsString()
  @IsOptional()
  commercialName?: string;

  @IsString()
  @IsOptional()
  addressStreet?: string;

  @IsString()
  @IsOptional()
  addressCity?: string;

  @IsString()
  @IsOptional()
  addressState?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+\d{10,15}$/, {
    message: 'El WhatsApp debe incluir código de país (ej: +5491123456789)',
  })
  whatsapp?: string;

  @IsString()
  @IsOptional()
  instagramUrl?: string;

  @IsString()
  @IsOptional()
  facebookUrl?: string;

  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}

