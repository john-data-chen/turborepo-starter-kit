import { PartialType } from "@nestjs/mapped-types";
import { CreateBoardDto } from "./create-board.dto";
import { IsString, IsOptional, IsArray, IsMongoId } from "class-validator";

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
