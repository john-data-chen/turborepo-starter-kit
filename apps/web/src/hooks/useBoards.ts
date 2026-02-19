"use client";

import { useMemo } from "react";

import { useBoards as useApiBoards } from "@/lib/api/boards/queries";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Board } from "@/types/dbInterface";

function normalizeBoard(board: Board): Board {
  return {
    ...board,
    members: Array.isArray(board.members) ? board.members : [],
    projects: Array.isArray(board.projects) ? board.projects : []
  };
}

export function useBoards() {
  const { userId } = useWorkspaceStore();
  const { data, isLoading, error, refetch } = useApiBoards();

  const { myBoards, teamBoards } = useMemo(() => {
    if (!data) {
      return { myBoards: [], teamBoards: [] };
    }

    if ("myBoards" in data && "teamBoards" in data) {
      return {
        myBoards: (data.myBoards || []).map(normalizeBoard),
        teamBoards: (data.teamBoards || []).map(normalizeBoard)
      };
    }

    const boards = Array.isArray(data) ? data : [];
    const myBoards: Board[] = [];
    const teamBoards: Board[] = [];

    boards.forEach((board: Board) => {
      const normalizedBoard = normalizeBoard(board);
      const ownerId =
        typeof normalizedBoard.owner === "string"
          ? normalizedBoard.owner
          : normalizedBoard.owner?._id;

      if (ownerId === userId) {
        myBoards.push(normalizedBoard);
      } else {
        teamBoards.push(normalizedBoard);
      }
    });

    return { myBoards, teamBoards };
  }, [data, userId]);

  return {
    myBoards,
    teamBoards,
    loading: isLoading,
    error,
    refresh: refetch
  };
}
