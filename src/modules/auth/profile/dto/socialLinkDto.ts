import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SocialLinkDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}

export class SocialLinkOrderDto {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsNumber()
  @IsNotEmpty()
  public position: number;
}
