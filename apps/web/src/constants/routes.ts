export const API_URL = 'http://localhost:3001';

export const ROUTES = {
  HOME: '/',
  API: API_URL,
  AUTH: {
    LOGIN: `${API_URL}/auth/login`, // Corrected path to match backend
    CALLBACK: `${API_URL}/api/auth/callback`
  },
  BOARDS: {
    ROOT: '/boards',
    VIEW: (id: string) => `/boards/${id}`
  }
} as const;
