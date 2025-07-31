'use client';

import { useBoards as useApiBoards } from '@/lib/api/boards/queries';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { Board } from '@/types/dbInterface';
import { useMemo } from 'react';

export function useBoards() {
  const { userId } = useWorkspaceStore();
  const { data, isLoading, error, refetch } = useApiBoards();

  // Split boards into myBoards and teamBoards based on ownership
  const { myBoards, teamBoards } = useMemo(() => {
    if (!data) {
      return { myBoards: [], teamBoards: [] };
    }

    // If we have separate myBoards and teamBoards from the API
    if ('myBoards' in data && 'teamBoards' in data) {
      return {
        myBoards: data.myBoards || [],
        teamBoards: data.teamBoards || []
      };
    }

    // Fallback: Split a single boards array based on ownership
    const boards = Array.isArray(data) ? data : [];
    const myBoards: Board[] = [];
    const teamBoards: Board[] = [];

    boards.forEach((board: Board) => {
      if (
        board.owner &&
        typeof board.owner === 'object' &&
        board.owner.id === userId
      ) {
        myBoards.push(board);
      } else {
        teamBoards.push(board);
      }
    });

    return { myBoards, teamBoards };
  }, [data, userId]);

  // Update the workspace store when data changes
  const { setMyBoards, setTeamBoards } = useWorkspaceStore();

  useMemo(() => {
    setMyBoards(myBoards);
    setTeamBoards(teamBoards);
  }, [myBoards, teamBoards, setMyBoards, setTeamBoards]);

  return {
    myBoards,
    teamBoards,
    loading: isLoading,
    error,
    refresh: refetch
  };
}
