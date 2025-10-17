import React from 'react'
import { boardApi } from '@/lib/api/boardApi'
import {
  useAddBoardMember,
  useBoard,
  useBoards,
  useCreateBoard,
  useDeleteBoard,
  useUpdateBoard
} from '@/lib/api/boards/queries'
import { BOARD_KEYS } from '@/types/boardApi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

// Mock boardApi
vi.mock('@/lib/api/boardApi', () => ({
  boardApi: {
    getBoards: vi.fn(),
    getBoardById: vi.fn(),
    createBoard: vi.fn(),
    updateBoard: vi.fn(),
    deleteBoard: vi.fn(),
    addBoardMember: vi.fn()
  }
}))

describe('Board Query Hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('useBoards', () => {
    it('should fetch boards successfully', async () => {
      const mockBoards = [
        { _id: '1', title: 'Board 1' },
        { _id: '2', title: 'Board 2' }
      ]
      ;(boardApi.getBoards as Mock).mockResolvedValue(mockBoards)

      const { result } = renderHook(() => useBoards(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockBoards)
      expect(boardApi.getBoards).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch boards')
      ;(boardApi.getBoards as Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useBoards(), { wrapper })

      // useBoards has retry: 3 with exponential backoff, so wait longer
      await waitFor(
        () => expect(result.current.isError).toBe(true),
        { timeout: 60000 } // Long timeout for retries with exponential backoff
      )

      expect(result.current.error).toEqual(mockError)
      // Should have retried 3 times (4 total calls)
      expect(boardApi.getBoards).toHaveBeenCalledTimes(4)
    }, 70000)
  })

  describe('useBoard', () => {
    it('should fetch single board successfully', async () => {
      const mockBoard = { _id: '1', title: 'Board 1' }
      ;(boardApi.getBoardById as Mock).mockResolvedValue(mockBoard)

      const { result } = renderHook(() => useBoard('1'), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockBoard)
      expect(boardApi.getBoardById).toHaveBeenCalledWith('1')
    })

    it('should not fetch when boardId is undefined', () => {
      const { result } = renderHook(() => useBoard(undefined), { wrapper })

      expect(result.current.data).toBeUndefined()
      expect(boardApi.getBoardById).not.toHaveBeenCalled()
    })
  })

  describe('useCreateBoard', () => {
    it('should create board and invalidate queries', async () => {
      const newBoard = { _id: '3', title: 'New Board' }
      ;(boardApi.createBoard as Mock).mockResolvedValue(newBoard)

      const { result } = renderHook(() => useCreateBoard(), { wrapper })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      await act(async () => {
        await result.current.mutateAsync({ title: 'New Board' })
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: BOARD_KEYS.list()
        })
      })

      const callArgs = (boardApi.createBoard as Mock).mock.calls[0]
      expect(callArgs[0]).toEqual({ title: 'New Board' })
    })
  })

  describe('useUpdateBoard', () => {
    it('should update board and invalidate queries', async () => {
      const updatedBoard = { _id: '1', title: 'Updated Board' }
      ;(boardApi.updateBoard as Mock).mockResolvedValue(updatedBoard)

      const { result } = renderHook(() => useUpdateBoard(), { wrapper })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      await act(async () => {
        await result.current.mutateAsync({ id: '1', title: 'Updated Board' })
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: BOARD_KEYS.list()
        })
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: BOARD_KEYS.detail('1')
        })
      })

      expect(boardApi.updateBoard).toHaveBeenCalledWith('1', { title: 'Updated Board' })
    })
  })

  describe('useDeleteBoard', () => {
    it('should delete board and remove from cache', async () => {
      ;(boardApi.deleteBoard as Mock).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useDeleteBoard(), { wrapper })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const removeSpy = vi.spyOn(queryClient, 'removeQueries')

      await act(async () => {
        await result.current.mutateAsync('1')
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: BOARD_KEYS.list()
        })
        expect(removeSpy).toHaveBeenCalledWith({
          queryKey: BOARD_KEYS.detail('1')
        })
      })

      const deleteCallArgs = (boardApi.deleteBoard as Mock).mock.calls[0]
      expect(deleteCallArgs[0]).toBe('1')
    })
  })

  describe('useAddBoardMember', () => {
    it('should add board member and invalidate queries', async () => {
      const updatedBoard = { _id: '1', title: 'Board 1', members: ['user1', 'user2'] }
      ;(boardApi.addBoardMember as Mock).mockResolvedValue(updatedBoard)

      const { result } = renderHook(() => useAddBoardMember(), { wrapper })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      await act(async () => {
        await result.current.mutateAsync({ boardId: '1', memberId: 'user2' })
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: BOARD_KEYS.detail('1')
        })
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: BOARD_KEYS.list()
        })
      })

      expect(boardApi.addBoardMember).toHaveBeenCalledWith('1', 'user2')
    })
  })
})
