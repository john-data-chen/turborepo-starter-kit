import { API_URL } from '@/constants/routes'
import { CreateBoardInput, UpdateBoardInput } from '@/types/boardApi'
import { Board } from '@/types/dbInterface'

// API Endpoint
const BOARDS_ENDPOINT = `${API_URL}/boards`

// Helper function to handle fetch requests
async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    // Get token from localStorage for Authorization header
    const token = localStorage.getItem('auth_token')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
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

    const responseText = await response.text()

    if (!response.ok) {
      let errorMessage = 'Request failed'
      try {
        const errorData = responseText ? JSON.parse(responseText) : {}
        errorMessage = errorData.message || response.statusText || 'Request failed'
      } catch (parseError) {
        console.error('Error parsing error response:', parseError)
        errorMessage = responseText || 'Request failed'
      }

      if (typeof window !== 'undefined' && response.status === 401) {
        console.error('Authentication error - redirecting to login')
        // Handle unauthorized (e.g., redirect to login)
        window.location.href = '/login'
      }

      throw new Error(errorMessage)
    }

    if (!responseText) {
      throw new Error('Empty response from server')
    }
    return JSON.parse(responseText) as T
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

/**
 * API client for board-related operations
 * This should be used by React Query hooks, not directly in components
 */
export const boardApi = {
  // Get all boards for the current user
  async getBoards(): Promise<{ myBoards: Board[]; teamBoards: Board[] }> {
    return fetchWithAuth(BOARDS_ENDPOINT)
  },

  // Get a single board by ID
  async getBoardById(id: string): Promise<Board> {
    return fetchWithAuth(`${BOARDS_ENDPOINT}/${id}`)
  },

  // Create a new board
  async createBoard(input: CreateBoardInput): Promise<Board> {
    return fetchWithAuth(BOARDS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(input)
    })
  },

  // Update a board
  async updateBoard(id: string, input: UpdateBoardInput): Promise<Board> {
    return fetchWithAuth(`${BOARDS_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    })
  },

  // Delete a board
  async deleteBoard(id: string): Promise<void> {
    try {
      // Get token from localStorage for Authorization header
      const token = localStorage.getItem('auth_token')

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add Authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${BOARDS_ENDPOINT}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers
      })

      // For 204 No Content responses, we don't expect a response body
      if (response.status === 204) {
        return
      }

      // For other successful responses, try to parse the response
      if (response.ok) {
        const responseText = await response.text()
        if (!responseText) {
          return // Empty response is acceptable for DELETE
        }
        return JSON.parse(responseText)
      }

      // Handle error responses
      const errorText = await response.text()
      let errorMessage = 'Failed to delete board'
      try {
        const errorData = errorText ? JSON.parse(errorText) : {}
        errorMessage = errorData.message || response.statusText || errorMessage
      } catch (e) {
        errorMessage = errorText || errorMessage
        console.error('Error parsing error response:', e)
      }
      throw new Error(errorMessage)
    } catch (error) {
      console.error('Error in deleteBoard:', error)
      throw error
    }
  },

  // Add a member to a board
  async addBoardMember(boardId: string, memberId: string): Promise<Board> {
    return fetchWithAuth(`${BOARDS_ENDPOINT}/${boardId}/members/${memberId}`, {
      method: 'POST'
    })
  }
}
