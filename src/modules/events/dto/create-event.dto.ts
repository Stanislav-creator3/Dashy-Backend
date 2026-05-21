import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;
} 