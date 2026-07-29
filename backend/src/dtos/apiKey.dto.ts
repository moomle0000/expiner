import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(64)
  public name: string;
}

export class CreateApiKeyResponseDto {
  public id: string;
  public name: string;
  public createdBy: string;
  public key: string;
  public createdAt: Date;
}
