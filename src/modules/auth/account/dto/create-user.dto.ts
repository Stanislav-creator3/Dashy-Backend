import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
