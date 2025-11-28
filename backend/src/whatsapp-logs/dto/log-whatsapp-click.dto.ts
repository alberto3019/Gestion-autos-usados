import { IsNotEmpty, IsString } from 'class-validator';

export class LogWhatsappClickDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;
}

