import { ApiProperty } from '@nestjs/swagger';

import { TaskStatus } from './create-task.dto';

export class TaskResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the task',
    example: '507f1f77bcf86cd799439011'
  })
  _id: string;

  @ApiProperty({
    description: 'The title of the task',
    example: 'Implement authentication'
  })
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    example: 'Implement JWT authentication with refresh tokens',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: 'The status of the task',
    enum: TaskStatus,
    example: TaskStatus.TODO
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'The due date of the task',
    example: '2025-12-31T23:59:59.999Z',
    required: false
  })
  dueDate?: Date;

  @ApiProperty({
    description: 'The ID of the board this task belongs to',
    example: '507f1f77bcf86cd799439011'
  })
  board: string;

  @ApiProperty({
    description: 'The ID of the project this task belongs to',
    example: '507f1f77bcf86cd799439012'
  })
  project: string;

  @ApiProperty({
    description: 'The ID of the user assigned to this task',
    example: '507f1f77bcf86cd799439013',
    required: false
  })
  assignee?: string;

  @ApiProperty({
    description: 'The ID of the user who created this task',
    example: '507f1f77bcf86cd799439014'
  })
  creator: string;

  @ApiProperty({
    description: 'The ID of the user who last modified this task',
    example: '507f1f77bcf86cd799439015'
  })
  lastModifier: string;

  @ApiProperty({
    description: 'The date when the task was created',
    example: '2025-07-29T08:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the task was last updated',
    example: '2025-07-29T08:30:00.000Z'
  })
  updatedAt: Date;
}
