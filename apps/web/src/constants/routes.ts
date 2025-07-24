export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    CALLBACK: '/api/auth/callback'
  },
  BOARDS: {
    ROOT: '/boards',
    VIEW: (id: string) => `/boards/${id}`
  },
  API: {
    USERS: {
      ROOT: '/api/users',
      SEARCH: '/api/users/search'
    }
  }
} as const;
