import { Project as ProjectType } from '@/types/dbInterface';
import mongoose, { Model } from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let ProjectModel: Model<ProjectType>;
try {
  ProjectModel = mongoose.model<ProjectType>('Project');
} catch {
  ProjectModel = mongoose.model<ProjectType>('Project', projectSchema);
}

export { ProjectModel };
export type { ProjectType };
