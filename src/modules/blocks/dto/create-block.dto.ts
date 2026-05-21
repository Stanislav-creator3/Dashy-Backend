import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export interface TextSegmentDto {
  text: string;
  color?: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
}
export class CreateBlockDto {
  @IsString()
  type: string;

  @IsString()
  tempId: string;

  @IsOptional()
  @IsArray()
  content?: TextSegmentDto[];

  @IsOptional()
  @IsObject()
  props?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  parentId?: string;
}
