import { ROUTES } from '@/constants/routes';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { fetchBoardsFromDb } from '@/lib/db/board';
import { useTaskStore } from '@/lib/store';
import { act, renderHook } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useParams: vi.fn()
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock('@/lib/db/board', () => ({
  fetchBoardsFromDb: vi.fn()
}));

vi.mock('@/lib/store', () => ({
  useTaskStore: vi.fn()
}));

describe('useBreadcrumbs Hook', () => {
  const mockUserEmail = 'test@example.com';
  const mockBoardId = 'board123';
  const mockBoard = {
    _id: mockBoardId,
    title: 'Test Board',
    description: 'Test Description',
    owner: { id: 'user123', name: 'Test User' },
    members: [],
    projects: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ boardId: mockBoardId });
    vi.mocked(useTaskStore).mockReturnValue(mockUserEmail);
  });

  it('should initialize with root breadcrumb', () => {
    const { result } = renderHook(() => useBreadcrumbs());

    expect(result.current.items).toEqual([
      {
        title: 'overview',
        link: ROUTES.BOARDS.ROOT,
        isRoot: true
      }
    ]);
    expect(result.current.rootLink).toBe(ROUTES.BOARDS.ROOT);
  });

  it('should fetch and add board breadcrumb when boardId exists', async () => {
    vi.mocked(fetchBoardsFromDb).mockResolvedValueOnce([mockBoard]);

    const { result } = renderHook(() => useBreadcrumbs());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.items).toEqual([
      {
        title: 'overview',
        link: ROUTES.BOARDS.ROOT,
        isRoot: true
      },
      {
        title: mockBoard.title,
        link: `/boards/${mockBoard._id}`
      }
    ]);
  });

  it('should handle fetch error gracefully', async () => {
    const mockError = new Error('Fetch failed');
    vi.mocked(fetchBoardsFromDb).mockRejectedValueOnce(mockError);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useBreadcrumbs());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to fetch board:',
      mockError
    );
    expect(result.current.items).toHaveLength(1);

    consoleSpy.mockRestore();
  });

  it('should not fetch board when boardId is missing', async () => {
    vi.mocked(useParams).mockReturnValue({});

    renderHook(() => useBreadcrumbs());

    expect(fetchBoardsFromDb).not.toHaveBeenCalled();
  });

  it('should not fetch board when userEmail is missing', async () => {
    vi.mocked(useTaskStore).mockReturnValue('');

    renderHook(() => useBreadcrumbs());

    expect(fetchBoardsFromDb).not.toHaveBeenCalled();
  });
});
