import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class WithdrawFundsDto {
  @IsString()
  accountId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
