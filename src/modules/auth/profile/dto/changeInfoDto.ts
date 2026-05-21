import { IsOptional, IsString, MinLength } from 'class-validator';

export class ChangeInfoDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  username: string;
}
