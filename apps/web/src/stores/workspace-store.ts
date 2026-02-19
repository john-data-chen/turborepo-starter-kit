import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createBoardSlice, type BoardSlice } from "./board-store";
import { createProjectSlice, type ProjectSlice } from "./project-store";
import { createTaskSlice, type TaskSlice } from "./task-store";

interface UserSlice {
  userId: string | null;
  userEmail: string | null;
  setUserInfo: (email: string, userId: string) => void;
}

interface FilterSlice {
  filter: { status: string | null; search: string };
  setFilter: (filter: Partial<FilterSlice["filter"]>) => void;
}

interface ResetSlice {
  resetInBoards: () => void;
}

type WorkspaceState = UserSlice & FilterSlice & ResetSlice & BoardSlice & ProjectSlice & TaskSlice;

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get, api) => ({
      // User slice (inline - too small for separate file)
      userId: null,
      userEmail: null,
      setUserInfo: (email: string, userId: string) => {
        if (!email || !userId) {
          throw new Error("Email and userId are required");
        }
        set((state) =>
          state.userEmail === email && state.userId === userId
            ? state
            : { ...state, userEmail: email, userId }
        );
      },

      // Filter slice (inline - too small for separate file)
      filter: { status: null, search: "" },
      setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),

      // Reset slice (inline - too small for separate file)
      resetInBoards: () =>
        set({
          projects: [],
          currentBoardId: null,
          filter: { status: null, search: "" }
        }),

      // Composed slices
      ...createBoardSlice(set, get, api as any),
      ...createProjectSlice(set, get, api as any),
      ...createTaskSlice(set, get, api as any)
    }),
    {
      name: "workspace-store",
      partialize: (state) => ({
        currentBoardId: state.currentBoardId,
        filter: state.filter
      })
    }
  )
);

export type { BoardSlice, ProjectSlice, TaskSlice };
