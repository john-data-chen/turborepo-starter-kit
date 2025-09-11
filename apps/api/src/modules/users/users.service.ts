import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User, UserDocument } from './schemas/users.schema'

// Enable debug logging for this file
const DEBUG = true

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<User | null> {
    const requestId = Math.random().toString(36).substring(2, 8)
    this.logger.log(`[${requestId}] [UserService] Looking up user by email: ${email}`)

    if (!email) {
      this.logger.warn(`[${requestId}] [UserService] No email provided for user lookup`)
      return null
    }

    try {
      this.logger.debug(`[${requestId}] [UserService] Executing database query for email: ${email}`)

      // Log the userModel instance to ensure it's properly injected
      this.logger.debug(`[${requestId}] [UserService] UserModel instance: ${this.userModel ? 'exists' : 'missing'}`)

      const startTime = Date.now()
      const user = await this.userModel.findOne({ email }).exec()
      const queryDuration = Date.now() - startTime

      if (user) {
        this.logger.log(
          `[${requestId}] [UserService] User found in ${queryDuration}ms`,
          DEBUG
            ? {
                userId: user._id?.toString(),
                email: user.email,
                queryDuration: `${queryDuration}ms`
              }
            : undefined
        )

        this.logger.debug(
          `[${requestId}] [UserService] Found user: ${JSON.stringify(
            {
              _id: user._id?.toString(),
              email: user.email,
              name: user.name
            },
            null,
            2
          )}`
        )
      } else {
        this.logger.warn(`[${requestId}] [UserService] No user found with email: ${email}`)
      }

      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error(`[${requestId}] [UserService] Error finding user by email ${email}: ${errorMessage}`, stack)
      // Don't expose database errors to the client
      throw new Error('An error occurred while processing your request')
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.log('[UserService] Fetching all users')

    try {
      const users = await this.userModel.find().exec()
      this.logger.debug(`[UserService] Found ${users.length} users`)
      return users
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(
        `[UserService] Error fetching all users: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      )
      throw error
    }
  }

  async searchByName(name: string): Promise<User[]> {
    this.logger.log(`[UserService] Searching for users by name: ${name}`)
    try {
      const query = name ? { name: { $regex: name, $options: 'i' } } : {}
      const users = await this.userModel.find(query).exec()
      this.logger.debug(`[UserService] Found ${users.length} users for name: ${name}`)
      return users
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(
        `[UserService] Error searching for users by name ${name}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      )
      throw error
    }
  }
}
