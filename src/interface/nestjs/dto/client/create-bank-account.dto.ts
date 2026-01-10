import { IsString, MinLength, IsOptional, IsNumber, IsPositive } from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  @MinLength(2)
  accountName!: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  initialBalance?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
