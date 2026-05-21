import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
