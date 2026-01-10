import { IsBoolean } from 'class-validator';

export class ToggleStockAvailabilityDto {
  @IsBoolean()
  isAvailable!: boolean;
}
