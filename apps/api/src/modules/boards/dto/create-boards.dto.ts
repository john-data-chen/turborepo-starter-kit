import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsMongoId()
  @IsNotEmpty()
  owner: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  members?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  projects?: string[];
}
