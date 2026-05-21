import {
  IsString,
  IsObject,
  IsUUID,
  IsDateString,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  type: string;

  @IsObject()
  data: Record<string, any>;

  @IsUUID()
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;
}
