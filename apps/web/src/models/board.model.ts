import { Board as BoardType } from '@/types/dbInterface';
import mongoose, { Model } from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
  },
  {
    timestamps: true
  }
);

boardSchema.index({ owner: 1 });
boardSchema.index({ members: 1 });

let BoardModel: Model<BoardType>;
try {
  BoardModel = mongoose.model<BoardType>('Board');
} catch {
  BoardModel = mongoose.model<BoardType>('Board', boardSchema);
}

export { BoardModel };
export type { BoardType };
