import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetPagesDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  page?: number;
}
