import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useWorkspaceStore } from '@/stores/workspace-store'
import type { Board } from '@/types/dbInterface'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key)
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: vi.fn()
}))

// Mock the board queries
vi.mock('@/lib/api/boards/queries', () => ({
  useBoard: vi.fn()
}))

describe('useBreadcrumbs', () => {
  beforeEach(() => {
    // Reset workspace store
    useWorkspaceStore.setState({
      userId: 'user-123',
      userEmail: 'test@example.com',
      myBoards: [],
      teamBoards: [],
      projects: [],
      isLoadingProjects: false,
      currentBoardId: null,
      filter: {
        status: null,
        search: ''
      }
    })
    vi.clearAllMocks()
  })

  it('should return root breadcrumb when no board is selected', async () => {
    const { useParams } = await import('next/navigation')
    const { useBoard } = await import('@/lib/api/boards/queries')

    vi.mocked(useParams).mockReturnValue({})
    vi.mocked(useBoard).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    const { result } = renderHook(() => useBreadcrumbs())

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].title).toBe('overview')
    expect(result.current.items[0].isRoot).toBe(true)
  })

  it('should include board in breadcrumbs when board is loaded', async () => {
    const { useParams } = await import('next/navigation')
    const { useBoard } = await import('@/lib/api/boards/queries')

    const mockBoard: Board = {
      _id: 'board-123',
      title: 'My Test Board',
      description: 'Test description',
      owner: 'user-123',
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    vi.mocked(useParams).mockReturnValue({ boardId: 'board-123' })
    vi.mocked(useBoard).mockReturnValue({
      data: mockBoard,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    const { result } = renderHook(() => useBreadcrumbs())

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2)
    })

    expect(result.current.items[0].title).toBe('overview')
    expect(result.current.items[0].isRoot).toBe(true)
    expect(result.current.items[1].title).toBe('My Test Board')
    expect(result.current.items[1].link).toContain('board-123')
  })

  it('should update workspace store with current board ID', async () => {
    const { useParams } = await import('next/navigation')
    const { useBoard } = await import('@/lib/api/boards/queries')

    const mockBoard: Board = {
      _id: 'board-123',
      title: 'My Test Board',
      description: 'Test description',
      owner: 'user-123',
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    vi.mocked(useParams).mockReturnValue({ boardId: 'board-123' })
    vi.mocked(useBoard).mockReturnValue({
      data: mockBoard,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    renderHook(() => useBreadcrumbs())

    await waitFor(() => {
      const state = useWorkspaceStore.getState()
      expect(state.currentBoardId).toBe('board-123')
    })
  })

  it('should handle loading state', async () => {
    const { useParams } = await import('next/navigation')
    const { useBoard } = await import('@/lib/api/boards/queries')

    vi.mocked(useParams).mockReturnValue({ boardId: 'board-123' })
    vi.mocked(useBoard).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn()
    })

    const { result } = renderHook(() => useBreadcrumbs())

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].title).toBe('overview')
  })

  it('should handle error state', async () => {
    const { useParams } = await import('next/navigation')
    const { useBoard } = await import('@/lib/api/boards/queries')

    vi.mocked(useParams).mockReturnValue({ boardId: 'board-123' })
    vi.mocked(useBoard).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load board'),
      refetch: vi.fn()
    })

    const { result } = renderHook(() => useBreadcrumbs())

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].title).toBe('overview')
  })

  it('should return correct root link', async () => {
    const { useParams } = await import('next/navigation')
    const { useBoard } = await import('@/lib/api/boards/queries')

    vi.mocked(useParams).mockReturnValue({})
    vi.mocked(useBoard).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    const { result } = renderHook(() => useBreadcrumbs())

    expect(result.current.rootLink).toBeDefined()
    expect(typeof result.current.rootLink).toBe('string')
  })

  it('should update breadcrumbs when board changes', async () => {
    const { useParams } = await import('next/navigation')
    const { useBoard } = await import('@/lib/api/boards/queries')

    const mockBoard1: Board = {
      _id: 'board-1',
      title: 'Board 1',
      description: 'Test description',
      owner: 'user-123',
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const mockBoard2: Board = {
      _id: 'board-2',
      title: 'Board 2',
      description: 'Test description',
      owner: 'user-123',
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    vi.mocked(useParams).mockReturnValue({ boardId: 'board-1' })
    vi.mocked(useBoard).mockReturnValue({
      data: mockBoard1,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    const { result, rerender } = renderHook(() => useBreadcrumbs())

    await waitFor(() => {
      expect(result.current.items[1]?.title).toBe('Board 1')
    })

    // Update to board 2
    vi.mocked(useParams).mockReturnValue({ boardId: 'board-2' })
    vi.mocked(useBoard).mockReturnValue({
      data: mockBoard2,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    rerender()

    await waitFor(() => {
      expect(result.current.items[1]?.title).toBe('Board 2')
    })
  })

  it('should not update workspace store when board ID is undefined', async () => {
    const { useParams } = await import('next/navigation')
    const { useBoard } = await import('@/lib/api/boards/queries')

    const mockBoard = {
      title: 'Test Board',
      description: 'Test description',
      owner: 'user-123',
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
      // _id is missing
    }

    vi.mocked(useParams).mockReturnValue({})
    vi.mocked(useBoard).mockReturnValue({
      data: mockBoard as Board,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    useWorkspaceStore.setState({ currentBoardId: 'old-board-id' })

    renderHook(() => useBreadcrumbs())

    // Wait a bit to ensure no update happens
    await new Promise((resolve) => setTimeout(resolve, 100))

    const state = useWorkspaceStore.getState()
    expect(state.currentBoardId).toBe('old-board-id')
  })

  it('should handle multiple params correctly', async () => {
    const { useParams } = await import('next/navigation')
    const { useBoard } = await import('@/lib/api/boards/queries')

    const mockBoard: Board = {
      _id: 'board-123',
      title: 'My Test Board',
      description: 'Test description',
      owner: 'user-123',
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    vi.mocked(useParams).mockReturnValue({
      boardId: 'board-123',
      locale: 'en',
      projectId: 'project-456'
    })
    vi.mocked(useBoard).mockReturnValue({
      data: mockBoard,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    })

    const { result } = renderHook(() => useBreadcrumbs())

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2)
    })

    expect(result.current.items[1].title).toBe('My Test Board')
  })
})
