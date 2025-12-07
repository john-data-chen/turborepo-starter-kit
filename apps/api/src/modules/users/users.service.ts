import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas/users.schema'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null
    }

    try {
      const user = await this.userModel.findOne({ email }).exec()
      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error(`Error finding user by email ${email}: ${errorMessage}`, stack)
      throw new Error('An error occurred while processing your request')
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userModel.find().exec()
      return users
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(
        `Error fetching all users: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      )
      throw error
    }
  }

  async searchByName(name: string): Promise<User[]> {
    try {
      const query = name ? { name: { $regex: name, $options: 'i' } } : {}
      const users = await this.userModel.find(query).exec()
      return users
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(
        `Error searching for users by name ${name}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      )
      throw error
    }
  }
}
