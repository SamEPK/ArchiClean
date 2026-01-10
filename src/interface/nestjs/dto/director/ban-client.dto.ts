import { IsBoolean } from 'class-validator';

export class BanClientDto {
  @IsBoolean()
  banned!: boolean;
}
