import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateStockDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
