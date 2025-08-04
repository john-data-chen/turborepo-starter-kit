import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'The title of the project' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The description of the project',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The ID of the board this project belongs to' })
  @IsString()
  @IsNotEmpty()
  boardId: string;
}
