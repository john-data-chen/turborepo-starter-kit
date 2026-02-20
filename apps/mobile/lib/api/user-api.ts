import type { User } from "@repo/store";

import { API_ROUTES } from "@/constants/routes";

import { fetchWithAuth } from "./fetch-with-auth";

interface ApiUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

function transformUserData(user: ApiUser): User {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  };
}

export const userApi = {
  searchUsers: async (username = "") => {
    const response = await fetchWithAuth<{ users: ApiUser[] }>(
      `${API_ROUTES.USERS}/search?username=${encodeURIComponent(username)}`
    );
    return (response.users || []).map(transformUserData);
  },
  getUserById: async (id: string) => {
    try {
      const response = await fetchWithAuth<{ user: ApiUser }>(`${API_ROUTES.USERS}/${id}`);
      return response.user ? transformUserData(response.user) : null;
    } catch {
      return null;
    }
  }
};
