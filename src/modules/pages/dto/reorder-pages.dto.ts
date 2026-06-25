import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class PageOrderItem {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  parentId: string | null;

  @IsInt()
  position: number;
}

export class ReorderPagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageOrderItem)
  pages: PageOrderItem[];
}
