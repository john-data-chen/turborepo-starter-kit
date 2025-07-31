import { API_URL } from '@/constants/routes';
import { CreateBoardInput, UpdateBoardInput } from '@/types/boardApi';
import { Board } from '@/types/dbInterface';

// API Endpoint
const BOARDS_ENDPOINT = `${API_URL}/boards`;

// Helper function to handle fetch requests
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Request failed');
    if (typeof window !== 'undefined' && response.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
    }
    throw new Error(error || 'Request failed');
  }

  return response.json();
}

/**
 * API client for board-related operations
 * This should be used by React Query hooks, not directly in components
 */
export const boardApi = {
  // Get all boards for the current user
  async getBoards(): Promise<{ myBoards: Board[]; teamBoards: Board[] }> {
    return fetchWithAuth(BOARDS_ENDPOINT);
  },

  // Get a single board by ID
  async getBoardById(id: string): Promise<Board> {
    return fetchWithAuth(`${BOARDS_ENDPOINT}/${id}`);
  },

  // Create a new board
  async createBoard(input: CreateBoardInput): Promise<Board> {
    return fetchWithAuth(BOARDS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  // Update a board
  async updateBoard(id: string, input: UpdateBoardInput): Promise<Board> {
    return fetchWithAuth(`${BOARDS_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
  },

  // Delete a board
  async deleteBoard(id: string): Promise<void> {
    await fetchWithAuth(`${BOARDS_ENDPOINT}/${id}`, {
      method: 'DELETE'
    });
  },

  // Add a member to a board
  async addBoardMember(boardId: string, memberId: string): Promise<Board> {
    return fetchWithAuth(`${BOARDS_ENDPOINT}/${boardId}/members/${memberId}`, {
      method: 'POST'
    });
  },

  // Remove a member from a board
  async removeBoardMember(boardId: string, memberId: string): Promise<Board> {
    return fetchWithAuth(`${BOARDS_ENDPOINT}/${boardId}/members/${memberId}`, {
      method: 'DELETE'
    });
  }
};
