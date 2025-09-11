'use client'

import { useEffect, useMemo } from 'react'
import { useBoards as useApiBoards } from '@/lib/api/boards/queries'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { Board } from '@/types/dbInterface'

// Helper function to ensure consistent board data structure
function normalizeBoard(board: Board): Board {
  return {
    ...board,
    // Ensure members is always an array
    members: Array.isArray(board.members) ? board.members : [],
    // Ensure projects is always an array
    projects: Array.isArray(board.projects) ? board.projects : []
  }
}

export function useBoards() {
  const { userId } = useWorkspaceStore()

  // Add logging to debug the issue
  console.log('[useBoards] Hook called with userId:', userId)

  const { data, isLoading, error, refetch } = useApiBoards()

  // Split boards into myBoards and teamBoards based on ownership
  const { myBoards, teamBoards } = useMemo(() => {
    if (!data) {
      return { myBoards: [], teamBoards: [] }
    }

    // If we have separate myBoards and teamBoards from the API
    if ('myBoards' in data && 'teamBoards' in data) {
      return {
        myBoards: (data.myBoards || []).map(normalizeBoard),
        teamBoards: (data.teamBoards || []).map(normalizeBoard)
      }
    }

    // Fallback: Split a single boards array based on ownership
    const boards = Array.isArray(data) ? data : []
    const myBoards: Board[] = []
    const teamBoards: Board[] = []

    boards.forEach((board: Board) => {
      const normalizedBoard = normalizeBoard(board)
      const ownerId = typeof normalizedBoard.owner === 'string' ? normalizedBoard.owner : normalizedBoard.owner?._id

      if (ownerId === userId) {
        myBoards.push(normalizedBoard)
      } else {
        teamBoards.push(normalizedBoard)
      }
    })

    return { myBoards, teamBoards }
  }, [data, userId])

  // Update the workspace store when data changes
  const { setMyBoards, setTeamBoards } = useWorkspaceStore()

  useEffect(() => {
    setMyBoards(myBoards)
    setTeamBoards(teamBoards)
  }, [myBoards, teamBoards, setMyBoards, setTeamBoards])

  return {
    myBoards,
    teamBoards,
    loading: isLoading,
    error,
    refresh: refetch
  }
}
