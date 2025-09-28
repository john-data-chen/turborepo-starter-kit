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

    // Helper to convert headers to Record<string, string>
    const getHeadersAsRecord = (inputHeaders?: Headers | string[][] | Record<string, string>): Record<string, string> => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (!inputHeaders) {return headers;}

      if (inputHeaders instanceof Headers) {
        inputHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(inputHeaders)) {
        inputHeaders.forEach(([key, value]) => {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        });
      } else {
        Object.entries(inputHeaders).forEach(([key, value]) => {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        });
      }

      return headers;
    };

    const baseHeaders = getHeadersAsRecord(options.headers);

    // Add Authorization header if token exists
    if (token) {
      baseHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Still include for cookie fallback
      headers: baseHeaders
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const errorData = responseText ? JSON.parse(responseText) : {};
        errorMessage = errorData.message || response.statusText || 'Request failed';
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorMessage = responseText || 'Request failed';
      }

      if (typeof window !== 'undefined' && response.status === 401) {
        console.error('Authentication error - redirecting to login');
        // Handle unauthorized (e.g., redirect to login)
        window.location.href = '/login';
      }

      throw new Error(errorMessage);
    }

    if (!responseText) {
      throw new Error('Empty response from server');
    }
    return JSON.parse(responseText) as T;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
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
    await fetchWithAuth<void>(`${BOARDS_ENDPOINT}/${id}`, {
      method: 'DELETE'
    });
  },

  // Add a member to a board
  async addBoardMember(boardId: string, memberId: string): Promise<Board> {
    return fetchWithAuth(`${BOARDS_ENDPOINT}/${boardId}/members/${memberId}`, {
      method: 'POST'
    })
  }
}
