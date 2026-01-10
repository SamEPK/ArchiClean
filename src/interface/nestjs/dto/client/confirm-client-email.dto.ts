import { IsString } from 'class-validator';

export class ConfirmClientEmailDto {
  @IsString()
  token!: string;
}
