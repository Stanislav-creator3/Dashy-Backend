import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/)
  public username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
