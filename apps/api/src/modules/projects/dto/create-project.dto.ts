import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({ description: "The title of the project" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "The description of the project",
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "The ID of the board this project belongs to" })
  @IsString()
  @IsNotEmpty()
  boardId: string;

  @ApiProperty({ description: "The ID of the user who owns this project" })
  @IsString()
  @IsNotEmpty()
  owner: string;

  @ApiProperty({
    description: "The order of the project in the board",
    required: false,
    default: 0
  })
  @IsOptional()
  orderInBoard?: number;
}
