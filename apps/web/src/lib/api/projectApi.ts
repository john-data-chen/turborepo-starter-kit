import { API_URL } from '@/constants/routes'
import { Project } from '@/types/dbInterface'
import { CreateProjectInput, UpdateProjectInput } from '@/types/projectApi'

// API Endpoint
const PROJECTS_ENDPOINT = `${API_URL}/projects`

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
    let errorMessage = 'Request failed'
    try {
      // Try to parse as JSON first
      const errorData = await response.json()
      errorMessage = errorData.message || JSON.stringify(errorData)
    } catch {
      // If JSON parsing fails, try to get text
      try {
        errorMessage = await response.text()
      } catch {
        errorMessage = `Request failed with status ${response.status}`
      }
    }

    if (typeof window !== 'undefined' && response.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

/**
 * API client for project-related operations
 * This should be used by React Query hooks, not directly in components
 */
export const projectApi = {
  // Get all projects for a board
  async getProjects(boardId: string): Promise<Project[]> {
    return fetchWithAuth(`${PROJECTS_ENDPOINT}?boardId=${boardId}`)
  },

  // Get a single project by ID
  async getProjectById(id: string): Promise<Project> {
    return fetchWithAuth(`${PROJECTS_ENDPOINT}/${id}`)
  },

  // Create a new project
  async createProject(input: CreateProjectInput): Promise<Project> {
    return fetchWithAuth(PROJECTS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(input)
    })
  },

  // Update a project
  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    return fetchWithAuth(`${PROJECTS_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    })
  },

  // Delete a project
  async deleteProject(id: string): Promise<void> {
    return fetchWithAuth(`${PROJECTS_ENDPOINT}/${id}`, {
      method: 'DELETE'
    })
  }
}
