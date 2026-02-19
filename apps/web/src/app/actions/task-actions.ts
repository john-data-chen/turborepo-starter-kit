"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

export async function createTask(data: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers,
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error("Failed to create task");
  }
  return response.json();
}

export async function updateTask(id: string, data: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error("Failed to update task");
  }
  return response.json();
}

export async function deleteTask(id: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers
  });
  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
}

export async function moveTask(taskId: string, projectId: string, orderInProject: number) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/tasks/${taskId}/move`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      projectId,
      orderInProject
    })
  });
  if (!response.ok) {
    throw new Error("Failed to move task");
  }
  return response.json();
}

export async function getTasks(projectId?: string, assigneeId?: string) {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (projectId) {
    params.append("projectId", projectId);
  }
  if (assigneeId) {
    params.append("assigneeId", assigneeId);
  }

  const query = params.toString();
  const url = query ? `${API_URL}/tasks?${query}` : `${API_URL}/tasks`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
}
