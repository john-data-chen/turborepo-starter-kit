import { ApiProperty } from '@nestjs/swagger';

import { TaskStatus } from './create-task.dto';

class UserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '507f1f77bcf86cd799439011'
  })
  _id: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe'
  })
  name?: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john@example.com'
  })
  email?: string;
}

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
    description: 'The user assigned to the task',
    type: UserResponseDto,
    required: false
  })
  assignee?: UserResponseDto | null;

  @ApiProperty({
    description: 'The user who created the task',
    type: UserResponseDto
  })
  creator: UserResponseDto;

  @ApiProperty({
    description: 'The user who last modified the task',
    type: UserResponseDto
  })
  lastModifier: UserResponseDto;

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
