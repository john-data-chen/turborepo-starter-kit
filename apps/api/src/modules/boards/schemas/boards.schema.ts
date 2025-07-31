import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BoardDocument = Board & Document;

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  members: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'Project' }])
  projects: Types.ObjectId[];
}

export const BoardSchema = SchemaFactory.createForClass(Board);

// Create indexes
BoardSchema.index({ owner: 1 });
BoardSchema.index({ members: 1 });
