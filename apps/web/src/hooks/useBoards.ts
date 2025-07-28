'use client';

import { fetchBoardsFromDb } from '@/lib/db/board';
import { useTaskStore } from '@/lib/workspace-store';
import { Board } from '@/types/dbInterface';
// Assuming Board type is needed for setMyBoards/setTeamBoards
import { useCallback, useEffect, useState } from 'react';

export function useBoards() {
  const [loading, setLoading] = useState(true);
  const {
    userEmail,
    userId,
    myBoards, // Zustand state
    teamBoards, // Zustand state
    setMyBoards, // Zustand action
    setTeamBoards // Zustand action
  } = useTaskStore();

  const fetchBoards = useCallback(async () => {
    if (!userEmail) {
      setMyBoards([]); // If no userEmail, clear boards
      setTeamBoards([]);
      setLoading(false); // And set loading to false
      return;
    }
    setLoading(true);
    try {
      const boardsFromDB = await fetchBoardsFromDb(userEmail); // Renamed to avoid conflict

      const userMyBoards: Board[] = [];
      const userTeamBoards: Board[] = [];

      boardsFromDB.forEach((board) => {
        // Ensure board.owner and board.owner.id exist before comparing
        if (
          board.owner &&
          typeof board.owner !== 'string' &&
          board.owner.id === userId
        ) {
          userMyBoards.push(board);
        } else {
          userTeamBoards.push(board);
        }
      });

      setMyBoards(userMyBoards);
      setTeamBoards(userTeamBoards);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      setMyBoards([]); // Clear boards on error
      setTeamBoards([]);
    } finally {
      setLoading(false);
    }
  }, [userEmail, userId, setMyBoards, setTeamBoards]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return { myBoards, teamBoards, loading, fetchBoards };
}
