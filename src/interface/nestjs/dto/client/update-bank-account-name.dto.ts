import { IsString, MinLength } from 'class-validator';

export class UpdateBankAccountNameDto {
  @IsString()
  @MinLength(2)
  accountName!: string;
}
