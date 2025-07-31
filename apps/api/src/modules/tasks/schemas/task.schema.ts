import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @ApiProperty({
    description: 'The unique identifier of the task',
    example: '507f1f77bcf86cd799439011'
  })
  _id: string;

  @Prop({ required: true })
  @ApiProperty({
    description: 'The title of the task',
    example: 'Implement authentication'
  })
  title: string;

  @Prop()
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
    example: TaskStatus.TODO
  })
  status: TaskStatus;

  @Prop()
  @ApiProperty({
    description: 'The due date of the task',
    example: '2025-12-31T23:59:59.999Z',
    required: false
  })
  dueDate?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Board', required: true })
  @ApiProperty({
    description: 'The ID of the board this task belongs to',
    example: '507f1f77bcf86cd799439011'
  })
  board: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  @ApiProperty({
    description: 'The ID of the project this task belongs to',
    example: '507f1f77bcf86cd799439012'
  })
  project: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  @ApiProperty({
    description: 'The ID of the user assigned to this task',
    example: '507f1f77bcf86cd799439013',
    required: false
  })
  assignee?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({
    description: 'The ID of the user who created this task',
    example: '507f1f77bcf86cd799439014'
  })
  creator: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
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

export const TaskSchema = SchemaFactory.createForClass(Task);
