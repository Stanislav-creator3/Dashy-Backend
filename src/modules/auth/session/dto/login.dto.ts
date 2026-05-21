import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  public password: string;

  @IsString()
  @IsOptional()
  @Length(6, 6)
  public pin?: string;
}
