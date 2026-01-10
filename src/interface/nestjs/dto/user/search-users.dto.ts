import { IsString, MinLength } from 'class-validator';

export class SearchUsersDto {
  @IsString()
  @MinLength(2, { message: 'La recherche doit contenir au moins 2 caractères' })
  query!: string;
}
