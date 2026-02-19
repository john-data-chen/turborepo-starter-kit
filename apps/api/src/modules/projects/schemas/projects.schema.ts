import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum ProjectStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  ARCHIVED = "ARCHIVED"
}

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  owner: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [] })
  members: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: "Board", required: true })
  board: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  orderInBoard: number;

  @Prop({
    type: String,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.TODO
  })
  status: ProjectStatus;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: Types.ObjectId, ref: "User" })
  assignee?: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
