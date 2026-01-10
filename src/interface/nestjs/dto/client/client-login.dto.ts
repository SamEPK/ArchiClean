import { IsEmail, IsString } from 'class-validator';

export class ClientLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
