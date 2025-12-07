/// <reference types="react" />
import React from 'react'
import { BoardOverview } from '@/components/kanban/BoardOverview'
import type { Board } from '@/types/dbInterface'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Ensure React is globally available
globalThis.React = React

// Mock dependencies
vi.mock('@/hooks/useBoards', () => ({
  useBoards: vi.fn()
}))

vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn()
}))

vi.mock('@/lib/auth/authService', () => ({
  AuthService: {
    getSession: vi.fn()
  }
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    setSession: vi.fn()
  }))
}))

vi.mock('@/stores/workspace-store', () => {
  const store = {
    userId: null,
    setUserInfo: vi.fn()
  }
  return {
    useWorkspaceStore: Object.assign(
      vi.fn(() => store),
      {
        getState: () => store
      }
    )
  }
})

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@/components/kanban/board/BoardActions', () => ({
  BoardActions: ({ children, onDelete }: any) => (
    <div data-testid="board-actions" onClick={onDelete}>
      {children}
    </div>
  )
}))

vi.mock('@/components/kanban/board/NewBoardDialog', () => ({
  default: ({ children }: any) => <div data-testid="new-board-dialog">{children}</div>
}))

describe('BoardOverview', () => {
  const mockMyBoards: Board[] = [
    {
      _id: 'board-1',
      title: 'My Board 1',
      description: 'Description 1',
      owner: 'user-1',
      members: [
        { _id: 'user-1', name: 'John Doe', email: 'john@example.com', createdAt: new Date() }
      ],
      projects: [{ _id: 'proj-1', title: 'Project 1' } as any],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'board-2',
      title: 'My Board 2',
      description: '',
      owner: 'user-1',
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  const mockTeamBoards: Board[] = [
    {
      _id: 'board-3',
      title: 'Team Board 1',
      description: 'Team Description',
      owner: {
        _id: 'user-2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date()
      } as any,
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn()
  }

  const mockSearchParams = {
    get: vi.fn(() => null),
    toString: vi.fn(() => '')
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const { useBoards } = await import('@/hooks/useBoards')
    const { useRouter, usePathname } = await import('@/i18n/navigation')
    const { useSearchParams } = await import('next/navigation')

    vi.mocked(useBoards).mockReturnValue({
      myBoards: mockMyBoards,
      teamBoards: mockTeamBoards,
      loading: false,
      refresh: vi.fn()
    })

    vi.mocked(useRouter).mockReturnValue(mockRouter)
    vi.mocked(usePathname).mockReturnValue('/boards')
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any)
  })

  it('should render loading state when boards are loading', async () => {
    const { useBoards } = await import('@/hooks/useBoards')
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: true,
      refresh: vi.fn()
    })

    render(<BoardOverview />)
    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('should render my boards section', () => {
    render(<BoardOverview />)

    expect(screen.getByTestId('myBoardsTitle')).toBeInTheDocument()
    expect(screen.getByText('My Board 1')).toBeInTheDocument()
    expect(screen.getByText('My Board 2')).toBeInTheDocument()
  })

  it('should render team boards section', () => {
    render(<BoardOverview />)

    expect(screen.getByTestId('teamBoardsTitle')).toBeInTheDocument()
    expect(screen.getByText('Team Board 1')).toBeInTheDocument()
  })

  it('should filter boards by search query', () => {
    render(<BoardOverview />)

    const searchInput = screen.getByPlaceholderText('searchBoards')
    fireEvent.change(searchInput, { target: { value: 'My Board 1' } })

    expect(screen.getByText('My Board 1')).toBeInTheDocument()
    expect(screen.queryByText('My Board 2')).not.toBeInTheDocument()
  })

  it('should render filter select', () => {
    render(<BoardOverview />)
    expect(screen.getByTestId('select-filter-trigger')).toBeInTheDocument()
  })

  it('should navigate to board on click', () => {
    render(<BoardOverview />)

    const boardCard = screen.getByText('My Board 1').closest('.cursor-pointer')
    fireEvent.click(boardCard!)

    expect(mockRouter.push).toHaveBeenCalledWith('/boards/board-1')
  })

  it('should show empty state when no my boards found', async () => {
    const { useBoards } = await import('@/hooks/useBoards')
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: mockTeamBoards,
      loading: false,
      refresh: vi.fn()
    })

    render(<BoardOverview />)
    expect(screen.getByText('noBoardsFound')).toBeInTheDocument()
  })

  it('should show empty state when no team boards found', async () => {
    const { useBoards } = await import('@/hooks/useBoards')
    vi.mocked(useBoards).mockReturnValue({
      myBoards: mockMyBoards,
      teamBoards: [],
      loading: false,
      refresh: vi.fn()
    })

    render(<BoardOverview />)
    expect(screen.getByText('noTeamBoardsFound')).toBeInTheDocument()
  })

  it('should show "noDescription" when board has no description', () => {
    render(<BoardOverview />)
    const noDescCards = screen.getAllByText('noDescription')
    expect(noDescCards.length).toBeGreaterThan(0)
  })

  it('should display board projects', () => {
    render(<BoardOverview />)
    expect(screen.getByText(/Project 1/)).toBeInTheDocument()
  })

  it('should display board members', () => {
    render(<BoardOverview />)
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
  })

  it('should handle login success', async () => {
    const { useSearchParams } = await import('next/navigation')
    const { AuthService } = await import('@/lib/auth/authService')
    const { toast } = await import('sonner')
    const { useBoards } = await import('@/hooks/useBoards')

    const mockRefresh = vi.fn()

    vi.mocked(useSearchParams).mockReturnValue({
      ...mockSearchParams,
      get: vi.fn(() => 'true')
    } as any)
    vi.mocked(AuthService.getSession).mockResolvedValue({
      user: {
        _id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      }
    } as any)

    vi.mocked(useBoards).mockReturnValue({
      myBoards: mockMyBoards,
      teamBoards: mockTeamBoards,
      loading: false,
      refresh: mockRefresh
    })

    render(<BoardOverview />)

    await waitFor(() => {
      expect(AuthService.getSession).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('success')
      expect(mockRefresh).toHaveBeenCalled()
      expect(mockRouter.replace).toHaveBeenCalled()
    })
  })

  it('should handle login error', async () => {
    const { useSearchParams } = await import('next/navigation')
    const { AuthService } = await import('@/lib/auth/authService')
    const { toast } = await import('sonner')

    vi.mocked(useSearchParams).mockReturnValue({
      ...mockSearchParams,
      get: vi.fn(() => 'true')
    } as any)
    vi.mocked(AuthService.getSession).mockRejectedValue(new Error('Session error'))

    render(<BoardOverview />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('error')
    })
  })

  it('should handle visibility change', async () => {
    const { useBoards } = await import('@/hooks/useBoards')
    const mockRefresh = vi.fn()

    vi.mocked(useBoards).mockReturnValue({
      myBoards: mockMyBoards,
      teamBoards: mockTeamBoards,
      loading: false,
      refresh: mockRefresh
    })

    render(<BoardOverview />)

    // Simulate visibility change
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'visible'
    })

    fireEvent(document, new Event('visibilitychange'))

    expect(mockRefresh).toHaveBeenCalled()
  })

  it('should render new board button', () => {
    render(<BoardOverview />)
    expect(screen.getByTestId('new-board-trigger')).toBeInTheDocument()
  })

  it('should render board actions', () => {
    render(<BoardOverview />)
    const actionsButtons = screen.getAllByTestId('board-actions')
    expect(actionsButtons.length).toBeGreaterThan(0)
  })

  it('should show 0 projects when board has no projects', () => {
    render(<BoardOverview />)
    const zeroProjects = screen.getAllByText(/projects:.*0/)
    expect(zeroProjects.length).toBeGreaterThan(0)
  })

  it('should display owner name for team boards', () => {
    render(<BoardOverview />)
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument()
  })
})
