import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetAgencyPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

