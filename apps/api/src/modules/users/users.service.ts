import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/users.schema';

// Enable debug logging for this file
const DEBUG = true;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const requestId = Math.random().toString(36).substring(2, 8);
    const startTime = Date.now();

    this.logger.log(
      `[${requestId}] [UserService] Starting user lookup by email`,
      DEBUG
        ? {
            requestId,
            email: email || 'undefined',
            timestamp: new Date().toISOString()
          }
        : undefined
    );

    if (!email) {
      this.logger.warn(
        `[${requestId}] [UserService] No email provided for user lookup`,
        { requestId, timestamp: new Date().toISOString() }
      );
      return null;
    }

    try {
      // Log MongoDB connection details
      const db = this.userModel.db;
      const dbName = db.name;
      const dbHost = db.host;
      const dbPort = db.port;

      this.logger.debug(
        `[${requestId}] [UserService] Database connection details`,
        DEBUG
          ? {
              dbName,
              dbHost,
              dbPort,
              collection: this.userModel.collection.name,
              modelMethods: Object.keys(this.userModel)
            }
          : undefined
      );

      // Log the query being executed
      const query = { email };
      this.logger.debug(
        `[${requestId}] [UserService] Executing findOne query`,
        DEBUG ? { query } : undefined
      );

      const user = await this.userModel.findOne(query).lean().exec();
      const queryDuration = Date.now() - startTime;

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
        );

        this.logger.debug(
          `[${requestId}] [UserService] User details`,
          DEBUG
            ? {
                ...user,
                _id: user._id?.toString()
                // Add any other relevant user fields
              }
            : undefined
        );
      } else {
        this.logger.warn(
          `[${requestId}] [UserService] No user found with email: ${email}`,
          DEBUG
            ? {
                email,
                queryDuration: `${queryDuration}ms`,
                collection: this.userModel.collection.name,
                query: { email }
              }
            : undefined
        );

        // Log additional debug info for missing user
        if (DEBUG) {
          try {
            const count = await this.userModel.countDocuments({}).exec();
            this.logger.debug(
              `[${requestId}] [UserService] Database statistics`,
              {
                totalUsers: count,
                sampleUser:
                  count > 0
                    ? await this.userModel
                        .findOne()
                        .select('email')
                        .lean()
                        .exec()
                    : 'No users in collection'
              }
            );
          } catch (error) {
            this.logger.error(
              `[${requestId}] [UserService] Error getting collection stats`,
              error instanceof Error ? error.stack : String(error)
            );
          }
        }
      }

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `[${requestId}] [UserService] Error finding user by email ${email}: ${errorMessage}`,
        stack
      );
      // Don't expose database errors to the client
      throw new Error('An error occurred while processing your request');
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.log('[UserService] Fetching all users');

    try {
      const users = await this.userModel.find().exec();
      this.logger.debug(`[UserService] Found ${users.length} users`);
      return users;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `[UserService] Error fetching all users: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  async searchByName(name: string): Promise<User[]> {
    this.logger.log(`[UserService] Searching for users by name: ${name}`);
    try {
      const query = name ? { name: { $regex: name, $options: 'i' } } : {};
      const users = await this.userModel.find(query).exec();
      this.logger.debug(
        `[UserService] Found ${users.length} users for name: ${name}`
      );
      return users;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `[UserService] Error searching for users by name ${name}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }
}
