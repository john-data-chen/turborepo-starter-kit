import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsMongoId
} from 'class-validator';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export class CreateTaskDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Implement authentication'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    example: 'Implement JWT authentication with refresh tokens',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The status of the task',
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    description: 'The due date of the task',
    example: '2025-12-31T23:59:59.999Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({
    description: 'The ID of the board this task belongs to',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  boardId: string;

  @ApiProperty({
    description: 'The ID of the project this task belongs to',
    example: '507f1f77bcf86cd799439012'
  })
  @IsMongoId()
  projectId: string;

  @ApiProperty({
    description: 'The ID of the user assigned to this task',
    example: '507f1f77bcf86cd799439013',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  assigneeId?: string;
}
