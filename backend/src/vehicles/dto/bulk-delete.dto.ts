import { IsArray, IsNotEmpty } from 'class-validator';

export class BulkDeleteDto {
  @IsArray()
  @IsNotEmpty()
  vehicleIds: string[];
}

