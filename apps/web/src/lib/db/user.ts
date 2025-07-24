'use server';

import { UserModel } from '@/models/user.model';
import { connectToDatabase } from './connect';

export async function getUserByEmail(email: string) {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ email: email }).lean();
    if (!user) {
      console.error('User not found');
      return null;
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUserById(id: string) {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ _id: id }).lean();
    if (!user) {
      console.error('User not found');
      return null;
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
