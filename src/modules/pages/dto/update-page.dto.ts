import { IsOptional, IsString } from 'class-validator';

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  @IsOptional()
  cover?: string;
}
