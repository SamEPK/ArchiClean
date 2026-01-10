import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class TransferFundsDto {
  @IsString()
  fromAccountId!: string;

  @IsString()
  toAccountId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
