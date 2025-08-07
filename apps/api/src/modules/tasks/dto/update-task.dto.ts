import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString
} from 'class-validator';

import { TaskStatus } from '../schemas/tasks.schema';

export class UpdateTaskDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Implement authentication',
    required: false
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The description of the task',
    example: 'Implement JWT authentication with refresh tokens',
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    description: 'The status of the task',
    enum: TaskStatus,
    required: false
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    description: 'The due date of the task',
    example: '2025-12-31T23:59:59.999Z',
    required: false,
    nullable: true
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date | null;

  @ApiProperty({
    description: 'The ID of the user assigned to this task',
    example: '507f1f77bcf86cd799439013',
    required: false,
    nullable: true
  })
  @IsMongoId()
  @IsOptional()
  assigneeId?: string | null;

  @ApiProperty({
    description: 'The ID of the user who last modified this task',
    example: '507f1f77bcf86cd799439014',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  lastModifier?: string;
}
