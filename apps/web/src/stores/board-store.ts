import type { Board } from "@repo/store";
import type { StateCreator } from "zustand";

import { boardApi } from "@/lib/api/boardApi";

import type { BoardSliceState, UserSliceState } from "./types";

export const createBoardSlice: StateCreator<
  BoardSliceState & Pick<UserSliceState, "userId">,
  [],
  [],
  BoardSliceState
> = (set, get) => ({
  currentBoardId: null,
  myBoards: [],
  teamBoards: [],

  setCurrentBoardId: (boardId: string) => {
    set({ currentBoardId: boardId });
  },

  addBoard: async (title: string, description?: string) => {
    try {
      const { userId } = get();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const newBoard = await boardApi.createBoard({
        title,
        description,
        owner: userId
      });

      if (newBoard) {
        set((state) => ({
          myBoards: [...state.myBoards, newBoard]
        }));

        return newBoard._id;
      }

      throw new Error("Failed to create board");
    } catch (error) {
      console.error("Error in addBoard:", error);
      throw error;
    }
  },

  updateBoard: async (id: string, data: Partial<Board>) => {
    try {
      await boardApi.updateBoard(id, data);

      set((state) => ({
        myBoards: state.myBoards.map((board) => (board._id === id ? { ...board, ...data } : board)),
        teamBoards: state.teamBoards.map((board) =>
          board._id === id ? { ...board, ...data } : board
        )
      }));
    } catch (error) {
      console.error("Error updating board:", error);
      throw error;
    }
  },

  removeBoard: async (id: string, deleteFn: (id: string) => Promise<void>) => {
    try {
      await deleteFn(id);

      set((state) => ({
        myBoards: state.myBoards.filter((board) => board._id === id),
        teamBoards: state.teamBoards.filter((board) => board._id !== id),
        currentBoardId: state.currentBoardId === id ? null : state.currentBoardId
      }));
    } catch (error) {
      console.error("Error removing board:", error);
      throw error;
    }
  }
});
