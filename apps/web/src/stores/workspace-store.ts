import { create } from "zustand";
import type { StoreApi } from "zustand";
import { persist } from "zustand/middleware";

import { createBoardSlice } from "./board-store";
import { createProjectSlice } from "./project-store";
import { createTaskSlice } from "./task-store";
import type { BoardSliceState, ProjectSliceState, TaskSliceState, WorkspaceState } from "./types";

export type { BoardSliceState, ProjectSliceState, TaskSliceState };

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get, api) => {
      const storeApi = api as unknown as StoreApi<WorkspaceState>;
      return {
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
        ...createBoardSlice(set, get, storeApi),
        ...createProjectSlice(set, get, storeApi),
        ...createTaskSlice(set, get, storeApi)
      };
    },
    {
      name: "workspace-store",
      partialize: (state) => ({
        currentBoardId: state.currentBoardId,
        filter: state.filter
      })
    }
  )
);
