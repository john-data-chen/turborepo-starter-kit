import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { User, UserDocument } from "../users/schemas/users.schema";
import { UserService } from "../users/users.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }

    try {
      return await this.userService.findByEmail(email);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Error validating user: ${errorMessage}`);
      throw new InternalServerErrorException("Authentication failed. Please try again.");
    }
  }

  async login(user: Pick<UserDocument, "email" | "_id"> & { name?: string }) {
    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user };
  }
}
