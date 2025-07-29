import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { User } from "../../user/schemas/user.schema";

export type BoardDocument = Board & Document;

export enum BoardVisibility {
  PRIVATE = "private",
  TEAM = "team",
  PUBLIC = "public",
}

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  owner: User;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: "User" }])
  members: User[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: "Project" }])
  projects: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: String,
    enum: Object.values(BoardVisibility),
    default: BoardVisibility.PRIVATE,
  })
  visibility: BoardVisibility;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BoardSchema = SchemaFactory.createForClass(Board);

// Indexes
BoardSchema.index({ owner: 1 });
BoardSchema.index({ members: 1 });
BoardSchema.index({ visibility: 1 });
