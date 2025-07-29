import { API_URL } from '@/constants/routes';
import { Project } from '@/types/dbInterface';

// Types
export interface CreateProjectInput {
  title: string;
  description?: string;
  boardId: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string | null;
}

// API Endpoints
const PROJECTS_ENDPOINT = `${API_URL}/projects`;

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

export const projectApi = {
  // Get all projects for a board
  async getProjects(boardId: string): Promise<Project[]> {
    return fetchWithAuth(`${PROJECTS_ENDPOINT}?board=${boardId}`);
  },

  // Get a single project by ID
  async getProjectById(id: string): Promise<Project> {
    return fetchWithAuth(`${PROJECTS_ENDPOINT}/${id}`);
  },

  // Create a new project
  async createProject(input: CreateProjectInput): Promise<Project> {
    return fetchWithAuth(PROJECTS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  // Update a project
  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    return fetchWithAuth(`${PROJECTS_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
  },

  // Delete a project
  async deleteProject(id: string): Promise<void> {
    await fetchWithAuth(`${PROJECTS_ENDPOINT}/${id}`, {
      method: 'DELETE'
    });
  }
};

// Query and Mutation Keys
export const PROJECT_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_KEYS.all, 'list'] as const,
  list: (boardId?: string) =>
    boardId
      ? ([...PROJECT_KEYS.lists(), { board: boardId }] as const)
      : ([...PROJECT_KEYS.lists()] as const),
  details: () => [...PROJECT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROJECT_KEYS.details(), id] as const
};
