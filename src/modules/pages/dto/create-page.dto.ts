import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PageType } from 'prisma/generated';

export class CreatePageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(PageType)
  type?: PageType;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  iconColor?: string;

  @IsOptional()
  @IsString()
  cover?: string;
}
