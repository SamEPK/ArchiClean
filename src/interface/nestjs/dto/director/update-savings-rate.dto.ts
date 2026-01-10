import { IsNumber, Min } from 'class-validator';

export class UpdateSavingsRateDto {
  @IsNumber()
  @Min(0)
  interestRate!: number;
}
