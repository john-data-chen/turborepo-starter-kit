import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSyncToastListener } from "@/hooks/useSyncToast";
import { BOARD_KEYS } from "@/types/boardApi";

import { boardApi } from "../boardApi";
import { suppressNextSyncToast } from "../sync-toast";

export const useBoards = () => {
  const query = useQuery({
    queryKey: BOARD_KEYS.list(),
    queryFn: async () => {
      return boardApi.getBoards();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
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
    mutationFn: async (input: Parameters<typeof boardApi.createBoard>[0]) =>
      boardApi.createBoard(input),
    onSuccess: () => {
      suppressNextSyncToast();
      void queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.list()
      });
    }
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Parameters<typeof boardApi.updateBoard>[1]) =>
      boardApi.updateBoard(id, updates),
    onSuccess: (updatedBoard) => {
      suppressNextSyncToast();
      void queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.list()
      });
      void queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.detail(updatedBoard._id)
      });
    }
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boardId: string) => boardApi.deleteBoard(boardId),
    onSuccess: (_, boardId) => {
      suppressNextSyncToast();
      void queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.list()
      });
      queryClient.removeQueries({
        queryKey: BOARD_KEYS.detail(boardId)
      });
    }
  });
};

export const useAddBoardMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ boardId, memberId }: { boardId: string; memberId: string }) =>
      boardApi.addBoardMember(boardId, memberId),
    onSuccess: (updatedBoard) => {
      suppressNextSyncToast();
      void queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.detail(updatedBoard._id)
      });
      void queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.list()
      });
    }
  });
};
