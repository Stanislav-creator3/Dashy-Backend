import { IsString, IsArray, ValidateNested } from 'class-validator';
import { InputJsonValue } from 'prisma/generated/runtime/library';

export class UpdateBlockDto {
  @IsArray()
  @ValidateNested({ each: true })
  blocks: {
    id?: string;
    tempId?: string;
    type: string;
    content?: InputJsonValue;
    props?: InputJsonValue;
    order: number;
    parentId?: string | null;
  }[];

  @IsString()
  pageId: string;
}
