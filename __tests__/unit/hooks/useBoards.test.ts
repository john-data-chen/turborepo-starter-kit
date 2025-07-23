import { useBoards } from '@/hooks/useBoards';
import { fetchBoardsFromDb } from '@/lib/db/board';
import { useTaskStore } from '@/lib/store';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@/lib/db/board', () => ({
  fetchBoardsFromDb: vi.fn()
}));

vi.mock('@/lib/store', () => ({
  useTaskStore: vi.fn()
}));

describe('useBoards Hook', () => {
  const mockSetMyBoards = vi.fn();
  const mockSetTeamBoards = vi.fn();
  const mockUserEmail = 'test@example.com';
  const mockUserId = 'user123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTaskStore).mockReturnValue({
      userEmail: mockUserEmail,
      userId: mockUserId,
      myBoards: [],
      teamBoards: [],
      setMyBoards: mockSetMyBoards,
      setTeamBoards: mockSetTeamBoards
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useBoards());
    expect(result.current.loading).toBe(true);
  });

  it('should fetch and categorize boards correctly', async () => {
    const mockBoards = [
      {
        _id: 'board1',
        title: 'My Board',
        description: 'Test board 1',
        owner: {
          id: mockUserId,
          name: 'Test User'
        },
        members: [],
        projects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'board2',
        title: 'Team Board',
        description: 'Test board 2',
        owner: {
          id: 'other123',
          name: 'Other User'
        },
        members: [
          {
            id: mockUserId,
            name: 'Test User'
          }
        ],
        projects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    vi.mocked(fetchBoardsFromDb).mockResolvedValueOnce(mockBoards);

    const { result } = renderHook(() => useBoards());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockSetMyBoards).toHaveBeenCalledWith([mockBoards[0]]);
    expect(mockSetTeamBoards).toHaveBeenCalledWith([mockBoards[1]]);
    expect(result.current.loading).toBe(false);
  });

  it('should handle fetch error correctly', async () => {
    const mockError = new Error('Fetch failed');
    vi.mocked(fetchBoardsFromDb).mockRejectedValueOnce(mockError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useBoards());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to fetch boards:',
      mockError
    );
    expect(mockSetMyBoards).toHaveBeenCalledWith([]);
    expect(mockSetTeamBoards).toHaveBeenCalledWith([]);
    expect(result.current.loading).toBe(false);

    consoleSpy.mockRestore();
  });

  it('should not fetch if userEmail is not available', async () => {
    vi.mocked(useTaskStore).mockReturnValue({
      userEmail: '',
      userId: mockUserId,
      myBoards: [],
      teamBoards: [],
      setMyBoards: mockSetMyBoards,
      setTeamBoards: mockSetTeamBoards
    });

    renderHook(() => useBoards());

    expect(fetchBoardsFromDb).not.toHaveBeenCalled();
  });

  it('should expose fetchBoards function for manual refresh', async () => {
    const mockBoards = [
      {
        _id: 'board1',
        title: 'My Board',
        description: 'Test board 1',
        owner: {
          id: mockUserId,
          name: 'Test User'
        },
        members: [],
        projects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    vi.mocked(fetchBoardsFromDb).mockResolvedValueOnce(mockBoards);

    const { result } = renderHook(() => useBoards());

    await act(async () => {
      await result.current.fetchBoards();
    });

    expect(mockSetMyBoards).toHaveBeenCalledWith(mockBoards);
    expect(mockSetTeamBoards).toHaveBeenCalledWith([]);
  });
});
