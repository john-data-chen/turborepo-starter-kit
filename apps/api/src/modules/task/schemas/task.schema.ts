import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";

export type TaskDocument = Task & Document;

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  IN_REVIEW = "in_review",
  DONE = "done",
  ARCHIVED = "archived",
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Prop()
  dueDate?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  creator: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User" })
  assignee?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Project", required: true })
  project: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Board", required: true })
  board: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  lastModifier: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Indexes for common queries
TaskSchema.index({ project: 1 });
TaskSchema.index({ board: 1 });
TaskSchema.index({ assignee: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });
