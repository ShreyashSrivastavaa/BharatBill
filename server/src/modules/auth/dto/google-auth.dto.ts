import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
