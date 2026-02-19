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

export async function createProject(data: {
  title: string;
  description?: string;
  boardId: string;
  owner: string;
  orderInBoard?: number;
}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error("Failed to create project");
  }
  return response.json();
}

export async function updateProject(id: string, data: Record<string, unknown>) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error("Failed to update project");
  }
  return response.json();
}

export async function deleteProject(id: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    headers
  });
  if (!response.ok) {
    throw new Error("Failed to delete project");
  }
}

export async function getProjects(boardId: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/projects?boardId=${boardId}`, {
    headers
  });
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  return response.json();
}
