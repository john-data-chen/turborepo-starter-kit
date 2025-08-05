import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: Types.ObjectId })
  @ApiProperty({
    description: 'The unique identifier of the task',
    example: '507f1f77bcf86cd799439011'
  })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  @ApiProperty({
    description: 'The title of the task',
    example: 'Implement authentication'
  })
  title: string;

  @Prop({ type: String })
  @ApiProperty({
    description: 'The description of the task',
    example: 'Implement JWT authentication with refresh tokens',
    required: false
  })
  description?: string;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  @ApiProperty({
    description: 'The status of the task',
    enum: TaskStatus,
    default: TaskStatus.TODO,
    example: TaskStatus.TODO
  })
  status: TaskStatus;

  @Prop({ type: Date })
  @ApiProperty({
    description: 'The due date of the task',
    example: '2025-12-31T23:59:59.999Z',
    required: false
  })
  dueDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({
    description: 'The user who created the task',
    type: 'string',
    example: '507f1f77bcf86cd799439011'
  })
  creator: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  @ApiProperty({
    description: 'The user assigned to the task',
    type: 'string',
    required: false,
    example: '507f1f77bcf86cd799439012'
  })
  assignee?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({
    description: 'The user who last modified the task',
    type: 'string',
    example: '507f1f77bcf86cd799439011'
  })
  lastModifier: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  @ApiProperty({
    description: 'The ID of the board this task belongs to',
    example: '507f1f77bcf86cd799439011'
  })
  board: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  @ApiProperty({
    description: 'The ID of the project this task belongs to',
    example: '507f1f77bcf86cd799439011'
  })
  project: Types.ObjectId;

  // User reference fields are defined above with proper documentation

  @Prop({ type: Date, default: Date.now })
  @ApiProperty({
    description: 'The date when the task was created',
    example: '2023-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  @ApiProperty({
    description: 'The date when the task was last updated',
    example: '2023-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
