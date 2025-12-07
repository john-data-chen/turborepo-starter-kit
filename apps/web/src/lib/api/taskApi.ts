import { API_URL } from '@/constants/routes'
import { fetchWithAuth } from '@/lib/api/fetchWithAuth'
import { Task } from '@/types/dbInterface'
import { CreateTaskInput, TaskPermissions, UpdateTaskInput } from '@/types/taskApi'

// API Endpoint
const TASKS_ENDPOINT = `${API_URL}/tasks`

/**
 * API client for task-related operations
 * This should be used by React Query hooks, not directly in components
 */
export const taskApi = {
  // Get all tasks (with optional filters)
  async getTasks(projectId?: string, assigneeId?: string): Promise<Task[]> {
    const params = new URLSearchParams()
    if (projectId) {
      params.append('projectId', projectId)
    }
    if (assigneeId) {
      params.append('assigneeId', assigneeId)
    }

    const query = params.toString()
    const url = query ? `${TASKS_ENDPOINT}?${query}` : TASKS_ENDPOINT

    return fetchWithAuth(url)
  },

  // Get a single task by ID
  async getTaskById(id: string): Promise<Task> {
    // Ensure the ID is properly encoded to handle special characters
    const encodedId = encodeURIComponent(id)
    return fetchWithAuth(`${TASKS_ENDPOINT}/${encodedId}`)
  },

  // Create a new task
  async createTask(input: CreateTaskInput): Promise<Task> {
    // Ensure the input matches the backend's expected format
    const requestBody = {
      ...input
      // No need to transform fields since we updated the CreateTaskInput type
    }

    return fetchWithAuth(TASKS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })
  },

  // Update a task
  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    return fetchWithAuth(`${TASKS_ENDPOINT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    })
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    return fetchWithAuth(
      `${TASKS_ENDPOINT}/${id}`,
      {
        method: 'DELETE'
      },
      true // Handle 204 No Content response
    )
  },

  // Check user permissions for a task
  async getTaskPermissions(taskId: string): Promise<TaskPermissions> {
    return fetchWithAuth(`${TASKS_ENDPOINT}/${taskId}/permissions`)
  },

  // Move task to a different project
  async moveTask(taskId: string, projectId: string, orderInProject: number): Promise<Task> {
    return fetchWithAuth(`${TASKS_ENDPOINT}/${taskId}/move`, {
      method: 'PATCH',
      body: JSON.stringify({
        projectId,
        orderInProject
      })
    })
  }
}
