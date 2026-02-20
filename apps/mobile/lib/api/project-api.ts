import type { Project } from "@repo/store";

import { API_ROUTES } from "@/constants/routes";

import { fetchWithAuth } from "./fetch-with-auth";

export interface CreateProjectInput {
  title: string;
  description?: string | null;
  boardId: string;
  owner?: string;
  orderInBoard?: number;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string | null;
  orderInBoard?: number;
}

export const projectApi = {
  getProjects: async (boardId: string) =>
    fetchWithAuth<Project[]>(`${API_ROUTES.PROJECTS}?boardId=${boardId}`),
  createProject: async (input: CreateProjectInput) =>
    fetchWithAuth<Project>(API_ROUTES.PROJECTS, {
      method: "POST",
      body: JSON.stringify(input)
    }),
  updateProject: async (id: string, input: UpdateProjectInput) =>
    fetchWithAuth<Project>(`${API_ROUTES.PROJECTS}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  deleteProject: async (id: string) =>
    fetchWithAuth<void>(
      `${API_ROUTES.PROJECTS}/${id}`,
      {
        method: "DELETE"
      },
      true
    )
};
