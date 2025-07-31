import { BOARD_KEYS } from '@/types/boardApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '../boardApi';

export const useBoards = () => {
  return useQuery({
    queryKey: BOARD_KEYS.list(),
    queryFn: () => boardApi.getBoards()
  });
};

export const useBoard = (boardId?: string) => {
  return useQuery({
    queryKey: BOARD_KEYS.detail(boardId || ''),
    queryFn: () => boardApi.getBoardById(boardId || ''),
    enabled: !!boardId
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: boardApi.createBoard,
    onSuccess: () => {
      // Invalidate the boards list query to refetch
      queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.list()
      });
    }
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: { id: string } & Parameters<typeof boardApi.updateBoard>[1]) =>
      boardApi.updateBoard(id, updates),
    onSuccess: (updatedBoard) => {
      // Invalidate both the list and the specific board
      queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.list()
      });
      queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.detail(updatedBoard._id)
      });
    }
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: boardApi.deleteBoard,
    onSuccess: (_, boardId) => {
      // Invalidate the boards list
      queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.list()
      });
      // Remove the specific board from the cache
      queryClient.removeQueries({
        queryKey: BOARD_KEYS.detail(boardId)
      });
    }
  });
};

export const useAddBoardMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      memberId
    }: {
      boardId: string;
      memberId: string;
    }) => boardApi.addBoardMember(boardId, memberId),
    onSuccess: (updatedBoard) => {
      // Invalidate the board data
      queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.detail(updatedBoard._id)
      });
      queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.list()
      });
    }
  });
};

export const useRemoveBoardMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      memberId
    }: {
      boardId: string;
      memberId: string;
    }) => boardApi.removeBoardMember(boardId, memberId),
    onSuccess: (updatedBoard) => {
      // Invalidate the board data
      queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.detail(updatedBoard._id)
      });
      queryClient.invalidateQueries({
        queryKey: BOARD_KEYS.list()
      });
    }
  });
};
