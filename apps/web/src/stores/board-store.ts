import type { Board } from "@repo/store";
import type { StateCreator } from "zustand";

import { boardApi } from "@/lib/api/boardApi";

export interface BoardSlice {
  currentBoardId: string | null;
  myBoards: Board[];
  teamBoards: Board[];
  setCurrentBoardId: (boardId: string) => void;
  addBoard: (title: string, description?: string) => Promise<string>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  removeBoard: (id: string, deleteFn: (id: string) => Promise<void>) => Promise<void>;
}

export const createBoardSlice: StateCreator<BoardSlice, [], [], BoardSlice> = (set, get) => ({
  currentBoardId: null,
  myBoards: [],
  teamBoards: [],

  setCurrentBoardId: (boardId: string) => {
    set({ currentBoardId: boardId });
  },

  addBoard: async (title: string, description?: string) => {
    try {
      const userId = (get() as any).userId;
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
        myBoards: state.myBoards.filter((board) => board._id !== id),
        teamBoards: state.teamBoards.filter((board) => board._id !== id),
        currentBoardId: state.currentBoardId === id ? null : state.currentBoardId
      }));
    } catch (error) {
      console.error("Error removing board:", error);
      throw error;
    }
  }
});
