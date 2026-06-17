import { Injectable, Logger } from "@nestjs/common";

import { UserRepository } from "./repositories/users.repository";
import { User, UserDocument } from "./schemas/users.schema";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    if (!email) {
      return null;
    }
    return this.userRepository.findByEmail(email);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async searchByName(name: string): Promise<User[]> {
    return this.userRepository.searchByName(name);
  }
}
