import { IsOptional, IsBooleanString } from 'class-validator';

export class ListBankAccountsQueryDto {
  @IsOptional()
  @IsBooleanString()
  includeInactive?: string;
}
