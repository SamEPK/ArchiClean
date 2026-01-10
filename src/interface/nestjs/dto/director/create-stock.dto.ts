import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateStockDto {
  @IsString()
  @MinLength(1)
  symbol!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  companyName!: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
