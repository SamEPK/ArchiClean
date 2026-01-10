import { IsString, IsNumber } from 'class-validator';

export class OpenSavingsDto {
  @IsString()
  accountId!: string;

  @IsNumber()
  interestRate!: number;
}
