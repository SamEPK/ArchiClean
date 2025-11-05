import { IsString, IsOptional, MinLength, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class SearchUsersDto {
  @IsString()
  @MinLength(2, { message: 'La recherche doit contenir au moins 2 caractères' })
  query!: string;
}
