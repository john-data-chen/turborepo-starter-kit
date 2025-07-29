import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../schemas/user.schema";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string) {
    try {
      const user = await this.userModel.findOne({ email }).lean().exec();
      if (!user) {
        return null;
      }
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const user = await this.userModel.findById(id).lean().exec();
      if (!user) {
        return null;
      }
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      console.error("Error finding user by id:", error);
      throw error;
    }
  }

  async create(createUserDto: {
    email: string;
    name: string;
    password: string;
  }) {
    try {
      const createdUser = new this.userModel(createUserDto);
      const savedUser = await createdUser.save();
      return {
        id: savedUser._id.toString(),
        email: savedUser.email,
        name: savedUser.name,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
}
