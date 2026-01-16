import { API_URL } from "@/constants/routes";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { ApiUser, User } from "@/types/userApi";

// API Endpoint
const USERS_ENDPOINT = `${API_URL}/users`;

// Helper function to transform API user to frontend user
function transformUserData(user: ApiUser): User;
function transformUserData(users: ApiUser[]): User[];
function transformUserData(users: ApiUser | ApiUser[]): User | User[] {
  const transform = (user: ApiUser): User => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  });

  return Array.isArray(users) ? users.map(transform) : transform(users);
}

/**
 * API client for user-related operations
 * This should be used by React Query hooks, not directly in components
 */
export const userApi = {
  // Search users by username or email
  async searchUsers(search = ""): Promise<User[]> {
    const response = await fetchWithAuth<{ users: ApiUser[] }>(
      `${USERS_ENDPOINT}/search?username=${encodeURIComponent(search)}`
    );
    return transformUserData(response.users || []);
  },

  // Get a single user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetchWithAuth<{ user: ApiUser }>(`${USERS_ENDPOINT}/${id}`);
      return response.user ? transformUserData(response.user) : null;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }
};
