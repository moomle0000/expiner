import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateFileDto {
  @IsString()
  public filename: string;

  @IsString()
  public originalName: string;

  @IsString()
  public path: string;

  @IsNumber()
  public size: number;

  @IsString()
  public mimetype: string;

  @IsString()
  public shortUrl: string;

  @IsEnum(['image', 'document', 'video', 'audio', 'archive', 'executable', 'other'])
  public fileType: string;

  @IsString()
  public extension: string;
}

export class UpdateFileDto {
  @IsString()
  @IsOptional()
  public filename?: string;

  @IsString()
  @IsOptional()
  public originalName?: string;

  @IsNumber()
  @IsOptional()
  public downloads?: number;

  @IsNumber()
  @IsOptional()
  public views?: number;
}