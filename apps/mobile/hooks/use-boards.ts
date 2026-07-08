import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { boardApi, type UpdateBoardInput } from "@/lib/api/board-api";

import { suppressNextSyncToast } from "./use-sync-toast";
import { useSyncToastListener } from "./use-sync-toast-listener";

export const BOARD_KEYS = {
  all: ["boards"] as const,
  lists: () => [...BOARD_KEYS.all, "list"] as const,
  list: () => [...BOARD_KEYS.lists()] as const,
  details: () => [...BOARD_KEYS.all, "detail"] as const,
  detail: (id: string) => [...BOARD_KEYS.details(), id] as const
};

export const useBoards = () => {
  const query = useQuery({
    queryKey: BOARD_KEYS.list(),
    queryFn: async () => boardApi.getBoards(),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5000
  });

  useSyncToastListener(query.data, !!query.data);

  return query;
};

export const useBoard = (boardId?: string) => {
  return useQuery({
    queryKey: BOARD_KEYS.detail(boardId || ""),
    queryFn: async () => boardApi.getBoardById(boardId || ""),
    enabled: !!boardId,
    refetchInterval: 5000
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boardApi.createBoard,
    onSuccess: () => {
      suppressNextSyncToast();
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.list() });
    }
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & UpdateBoardInput) =>
      boardApi.updateBoard(id, updates),
    onSuccess: (updatedBoard) => {
      suppressNextSyncToast();
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.list() });
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(updatedBoard._id) });
    }
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boardApi.deleteBoard,
    onSuccess: (_, boardId) => {
      suppressNextSyncToast();
      queryClient.invalidateQueries({ queryKey: BOARD_KEYS.list() });
      queryClient.removeQueries({ queryKey: BOARD_KEYS.detail(boardId) });
    }
  });
};
