export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export const API_ROUTES = {
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    PROFILE: `${API_URL}/auth/profile`,
    LOGOUT: `${API_URL}/auth/logout`
  },
  BOARDS: `${API_URL}/boards`,
  PROJECTS: `${API_URL}/projects`,
  TASKS: `${API_URL}/tasks`,
  USERS: `${API_URL}/users`
} as const;
