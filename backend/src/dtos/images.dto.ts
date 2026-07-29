import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateImageDto {
  @IsNotEmpty()
  @IsString()
  public originalName: string;

  @IsNotEmpty()
  @IsString()
  public filename: string;

  @IsNotEmpty()
  @IsString()
  public path: string;

  @IsNotEmpty()
  public size: number;

  @IsNotEmpty()
  @IsString()
  public mimetype: string;

  @IsNotEmpty()
  @IsString()
  public shortUrl: string;
}