import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  /**
   * This is a temporary placeholder method.
   * In a real application, this would query the database.
   * @param email The user's email
   * @returns A mock user object or null
   */
  async findByEmail(email: string): Promise<any> {
    console.log(`(Temporary) Searching for user: ${email}`);
    // Return a mock user for testing purposes
    if (email === "test@example.com") {
      return { id: "1", email: "test@example.com", name: "Test User" };
    }
    return null;
  }
}
