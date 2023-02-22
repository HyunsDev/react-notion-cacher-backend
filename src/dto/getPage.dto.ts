import { IsOptional, IsString } from 'class-validator';

export class GetPageDto {
  @IsOptional()
  @IsString()
  pageId?: string;

  @IsOptional()
  @IsString()
  pageCode?: string;

  @IsOptional()
  @IsString()
  domain?: string;
}
