import { API_URL } from '@/constants/routes';
import { Task, TaskStatus } from '@/types/dbInterface';

// Types
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: Date;
  boardId: string;
  projectId: string;
  assigneeId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: Date | null;
  assigneeId?: string | null;
}

// API Endpoints
const TASKS_ENDPOINT = `${API_URL}/tasks`;

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

// Task API methods
export const taskApi = {
  // Get all tasks (with optional filters)
  async getTasks(projectId?: string, assigneeId?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (assigneeId) params.append('assigneeId', assigneeId);

    const query = params.toString();
    const url = query ? `${TASKS_ENDPOINT}?${query}` : TASKS_ENDPOINT;

    return fetchWithAuth<Task[]>(url);
  },

  // Get a single task by ID
  async getTaskById(id: string): Promise<Task> {
    return fetchWithAuth<Task>(`${TASKS_ENDPOINT}/${id}`);
  },

  // Create a new task
  async createTask(input: CreateTaskInput): Promise<Task> {
    return fetchWithAuth<Task>(TASKS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  // Update a task
  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    return fetchWithAuth<Task>(`${TASKS_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
  },

  // Update task status
  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return fetchWithAuth<Task>(`${TASKS_ENDPOINT}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    return fetchWithAuth<void>(`${TASKS_ENDPOINT}/${id}`, {
      method: 'DELETE'
    });
  }
};

// Query and Mutation Keys
export const TASK_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (filters: { projectId?: string; assigneeId?: string } = {}) =>
    [...TASK_KEYS.lists(), filters] as const,
  details: () => [...TASK_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const
};
