import { API_URL } from '@/constants/routes'
import { ApiUser, User } from '@/types/userApi'

// API Endpoint
const USERS_ENDPOINT = `${API_URL}/users`

// Helper function to handle fetch requests
async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  // Get token from localStorage for Authorization header
  const token = localStorage.getItem('auth_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Add existing headers if they exist
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(options.headers)) {
      // Handle array format [['key', 'value'], ...]
      options.headers.forEach(([key, value]) => {
        headers[key] = value
      })
    } else {
      // Handle object format
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value
        }
      })
    }
  }

  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Still include for cookie fallback
    headers
  })

  if (!response.ok) {
    const error = await response.text().catch(() => 'Request failed')
    if (typeof window !== 'undefined' && response.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
    }
    throw new Error(error || 'Request failed')
  }

  return response.json()
}

// Helper function to transform API user to frontend user
function transformUserData(user: ApiUser): User
function transformUserData(users: ApiUser[]): User[]
function transformUserData(users: ApiUser | ApiUser[]): User | User[] {
  const transform = (user: ApiUser): User => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt)
  })

  return Array.isArray(users) ? users.map(transform) : transform(users)
}

/**
 * API client for user-related operations
 * This should be used by React Query hooks, not directly in components
 */
export const userApi = {
  // Search users by username or email
  async searchUsers(search = ''): Promise<User[]> {
    const response = await fetchWithAuth<{ users: ApiUser[] }>(
      `${USERS_ENDPOINT}/search?username=${encodeURIComponent(search)}`
    )
    return transformUserData(response.users || [])
  },

  // Get a single user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetchWithAuth<{ user: ApiUser }>(`${USERS_ENDPOINT}/${id}`)
      return response.user ? transformUserData(response.user) : null
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw error
    }
  }
}
