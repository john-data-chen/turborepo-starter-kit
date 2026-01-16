// User-related types and constants that are used across the application

// API User Type (matches backend response)
export interface ApiUser {
  _id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

// Frontend User Type
export interface User {
  _id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

// Query and Mutation Keys
export const USER_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_KEYS.all, "list"] as const,
  list: (filters: { search?: string } = {}) =>
    [...USER_KEYS.lists(), ...(filters.search ? [`search:${filters.search}`] : [])] as const,
  details: () => [...USER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const
} as const
