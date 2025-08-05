import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

import { CreateBoardDto } from './create-boards.dto';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  members?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  projects?: string[];
}
