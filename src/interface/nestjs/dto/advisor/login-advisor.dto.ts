import { IsEmail, IsString } from 'class-validator';

export class LoginAdvisorDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
