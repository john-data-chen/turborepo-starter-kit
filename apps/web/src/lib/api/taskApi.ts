import { API_URL } from '@/constants/routes';
import { Task, TaskStatus } from '@/types/dbInterface';
import {
  CreateTaskInput,
  TaskPermissions,
  UpdateTaskInput
} from '@/types/taskApi';

// API Endpoint
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

/**
 * API client for task-related operations
 * This should be used by React Query hooks, not directly in components
 */
export const taskApi = {
  // Get all tasks (with optional filters)
  async getTasks(projectId?: string, assigneeId?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (assigneeId) params.append('assigneeId', assigneeId);

    const query = params.toString();
    const url = query ? `${TASKS_ENDPOINT}?${query}` : TASKS_ENDPOINT;

    return fetchWithAuth(url);
  },

  // Get a single task by ID
  async getTaskById(id: string): Promise<Task> {
    // Ensure the ID is properly encoded to handle special characters
    const encodedId = encodeURIComponent(id);
    return fetchWithAuth(`${TASKS_ENDPOINT}/${encodedId}`);
  },

  // Create a new task
  async createTask(input: CreateTaskInput): Promise<Task> {
    return fetchWithAuth(TASKS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  // Update a task
  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    return fetchWithAuth(`${TASKS_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
  },

  // Update task status
  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return this.updateTask(id, { status });
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    return fetchWithAuth(`${TASKS_ENDPOINT}/${id}`, {
      method: 'DELETE'
    });
  },

  // Check user permissions for a task
  async getTaskPermissions(taskId: string): Promise<TaskPermissions> {
    return fetchWithAuth(`${TASKS_ENDPOINT}/${taskId}/permissions`);
  }
};
