// Get API URL from environment variable or fallback to local development URL
export const API_URL = process.env.NEST_API_URL || 'http://localhost:3001';

export const ROUTES = {
  HOME: '/',
  API: API_URL,
  AUTH: {
    LOGIN_API: `${API_URL}/auth/login`,
    LOGIN_PAGE: '/login'
  },
  BOARDS: {
    OVERVIEW_PAGE: '/boards'
  }
} as const;
