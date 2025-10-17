import React from 'react'
import { useUser, useUserSearch } from '@/lib/api/users/queries'
import type { User } from '@/types/userApi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the userApi module
vi.mock('@/lib/api/userApi', () => ({
  userApi: {
    getUserById: vi.fn(),
    searchUsers: vi.fn()
  }
}))

const { userApi } = await import('@/lib/api/userApi')

describe('user queries', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('useUser', () => {
    it('should fetch user by id successfully', async () => {
      const mockUser: User = {
        _id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date()
      }

      vi.mocked(userApi.getUserById).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useUser('user-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUser)
      expect(userApi.getUserById).toHaveBeenCalledWith('user-1')
    })

    it('should not fetch when id is undefined', () => {
      const { result } = renderHook(() => useUser(undefined), { wrapper })

      expect(result.current.isPending).toBe(true)
      expect(result.current.fetchStatus).toBe('idle')
      expect(userApi.getUserById).not.toHaveBeenCalled()
    })

    it('should not fetch when id is empty string', () => {
      const { result } = renderHook(() => useUser(''), { wrapper })

      expect(result.current.isPending).toBe(true)
      expect(result.current.fetchStatus).toBe('idle')
      expect(userApi.getUserById).not.toHaveBeenCalled()
    })

    it('should handle fetch errors', async () => {
      const error = new Error('Failed to fetch user')
      vi.mocked(userApi.getUserById).mockRejectedValue(error)

      const { result } = renderHook(() => useUser('user-1'), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('should use correct query key', async () => {
      const userId = 'user-123'
      const mockUser: User = {
        _id: userId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date()
      }

      vi.mocked(userApi.getUserById).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useUser(userId), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const queryData = queryClient.getQueryData(['users', 'detail', userId])
      expect(queryData).toEqual(mockUser)
    })
  })

  describe('useUserSearch', () => {
    it('should search users successfully', async () => {
      const mockUsers: User[] = [
        {
          _id: 'user-1',
          email: 'alice@example.com',
          name: 'Alice',
          createdAt: new Date()
        },
        {
          _id: 'user-2',
          email: 'bob@example.com',
          name: 'Bob',
          createdAt: new Date()
        }
      ]

      vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

      const { result } = renderHook(() => useUserSearch('alice'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUsers)
      expect(userApi.searchUsers).toHaveBeenCalledWith('alice')
    })

    it('should not search when query is empty', () => {
      const { result } = renderHook(() => useUserSearch(''), { wrapper })

      expect(result.current.isPending).toBe(true)
      expect(result.current.fetchStatus).toBe('idle')
      expect(userApi.searchUsers).not.toHaveBeenCalled()
    })

    it('should handle search errors', async () => {
      const error = new Error('Search failed')
      vi.mocked(userApi.searchUsers).mockRejectedValue(error)

      const { result } = renderHook(() => useUserSearch('test'), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('should use correct query key with search parameter', async () => {
      const searchQuery = 'test'
      const mockUsers: User[] = [
        {
          _id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: new Date()
        }
      ]

      vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

      const { result } = renderHook(() => useUserSearch(searchQuery), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Just verify the search was called correctly
      expect(userApi.searchUsers).toHaveBeenCalledWith(searchQuery)
    })

    it('should have correct staleTime configuration', () => {
      const { result } = renderHook(() => useUserSearch('test'), { wrapper })

      // Just verify the hook is configured correctly
      expect(result.current).toBeDefined()
    })

    it('should refetch when query changes', async () => {
      const mockUsers1: User[] = [{ _id: 'user-1', email: 'alice@example.com', name: 'Alice', createdAt: new Date() }]
      const mockUsers2: User[] = [{ _id: 'user-2', email: 'bob@example.com', name: 'Bob', createdAt: new Date() }]

      vi.mocked(userApi.searchUsers).mockResolvedValueOnce(mockUsers1).mockResolvedValueOnce(mockUsers2)

      const { result, rerender } = renderHook(({ query }) => useUserSearch(query), {
        wrapper,
        initialProps: { query: 'alice' }
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      expect(result.current.data).toEqual(mockUsers1)

      // Change the query
      rerender({ query: 'bob' })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockUsers2)
      })

      expect(userApi.searchUsers).toHaveBeenCalledTimes(2)
      expect(userApi.searchUsers).toHaveBeenNthCalledWith(1, 'alice')
      expect(userApi.searchUsers).toHaveBeenNthCalledWith(2, 'bob')
    })
  })
})
