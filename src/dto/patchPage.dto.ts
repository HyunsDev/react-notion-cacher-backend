import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PatchPageDto {
  @IsOptional()
  @IsString()
  pageCode?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsBoolean()
  reCaching?: boolean;

  @IsOptional()
  @IsBoolean()
  lazyReCaching?: boolean;
}
