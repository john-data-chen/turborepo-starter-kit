import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator'

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
  title: string

  @ApiProperty({
    description: 'The description of the task',
    example: 'Implement JWT authentication with refresh tokens',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: 'The status of the task',
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus

  @ApiProperty({
    description: 'The due date of the task',
    example: '2025-12-31T23:59:59.999Z',
    required: false
  })
  @IsDateString()
  @IsOptional()
  dueDate?: Date

  @ApiProperty({
    description: 'The order of the task within its project',
    example: 0,
    required: false
  })
  @IsNumber()
  @IsOptional()
  orderInProject?: number

  @ApiProperty({
    description: 'The ID of the board this task belongs to',
    example: '507f1f77bcf86cd799439011'
  })
  @IsMongoId()
  board: string

  @ApiProperty({
    description: 'The ID of the project this task belongs to',
    example: '507f1f77bcf86cd799439012'
  })
  @IsMongoId()
  project: string

  @ApiProperty({
    description: 'The ID of the user who created this task',
    example: '507f1f77bcf86cd799439014'
  })
  @IsMongoId()
  creator: string

  @ApiProperty({
    description: 'The ID of the user assigned to this task',
    example: '507f1f77bcf86cd799439013',
    required: false
  })
  @IsMongoId()
  @IsOptional()
  assignee?: string

  @ApiProperty({
    description: 'The ID of the user who last modified this task',
    example: '507f1f77bcf86cd799439014'
  })
  @IsMongoId()
  lastModifier: string
}
