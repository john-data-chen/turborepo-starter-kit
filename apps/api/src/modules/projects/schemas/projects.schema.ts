import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

import { ProjectStatus } from '../dto/update-project.dto'

export type ProjectDocument = Project & Document

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: String, required: true })
  title: string

  @Prop({ type: String })
  description?: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  board: Types.ObjectId

  @Prop({ type: Number, default: 0 })
  orderInBoard: number

  @Prop({
    type: String,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.TODO
  })
  status: ProjectStatus

  @Prop({ type: Date })
  dueDate?: Date

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignee?: Types.ObjectId

  @Prop({ type: Date, default: Date.now })
  createdAt: Date

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date
}

// Create the schema
const ProjectSchema = SchemaFactory.createForClass(Project)

// Add pre-save hook to update the updatedAt timestamp
ProjectSchema.pre<ProjectDocument>('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export { ProjectSchema }
