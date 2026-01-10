import { IsOptional, IsDateString } from 'class-validator';

export class ApplyDailyInterestDto {
  @IsOptional()
  @IsDateString()
  currentDate?: string;
}
