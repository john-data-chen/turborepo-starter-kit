import { User as UserType } from '@/types/dbInterface';
import mongoose, { Model } from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let UserModel: Model<UserType>;
try {
  UserModel = mongoose.model<UserType>('User');
} catch {
  UserModel = mongoose.model<UserType>('User', userSchema);
}

export { UserModel };
