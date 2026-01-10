import { IsString, IsNumber, IsPositive } from 'class-validator';

export class GrantCreditDto {
  @IsString()
  clientId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsNumber()
  annualRate!: number;

  @IsNumber()
  insuranceRate!: number;

  @IsNumber()
  @IsPositive()
  durationMonths!: number;
}
