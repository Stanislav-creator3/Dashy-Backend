import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}
