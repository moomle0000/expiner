import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, IsIn } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(64)
  public name: string;

  @IsEmail()
  public email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  public password: string;
}

export class LoginUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public password: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(64)
  public name?: string;

  @IsEmail()
  @IsOptional()
  public email?: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  public currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  public newPassword: string;
}

export class CreateUserAdminDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(64)
  public name: string;

  @IsEmail()
  public email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  public password: string;

  @IsIn(['admin', 'user'])
  @IsOptional()
  public role?: 'admin' | 'user';
}

export class AuthResponseDto {
  public token: string;
  public user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    folderSlug: string;
  };
}
