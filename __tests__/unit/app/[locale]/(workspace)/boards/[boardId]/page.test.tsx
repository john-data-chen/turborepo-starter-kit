import BoardPage from '@/app/[locale]/(workspace)/boards/[boardId]/page';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock hooks
vi.mock('next/navigation', () => ({
  useParams: () => ({ boardId: 'test-board-id' })
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

// Mock store
const setCurrentBoardIdMock = vi.fn();
const fetchProjectsMock = vi.fn();

vi.mock('@/lib/store', () => ({
  useTaskStore: (selector: (state: any) => any) =>
    selector({
      setCurrentBoardId: setCurrentBoardIdMock,
      fetchProjects: fetchProjectsMock
    })
}));

// Mock components
vi.mock('@/components/kanban/board/Board', () => ({
  Board: () => <div data-testid="mock-board">Mock Board</div>
}));

vi.mock('@/components/layout/PageContainer', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-page-container">{children}</div>
  )
}));

describe('BoardPage', () => {
  beforeEach(() => {
    setCurrentBoardIdMock.mockClear();
    fetchProjectsMock.mockClear();
  });

  it('should render the board and call store actions on mount', () => {
    // Action
    render(<BoardPage />);

    // Assertions
    expect(screen.getByTestId('mock-page-container')).toBeInTheDocument();
    expect(screen.getByTestId('mock-board')).toBeInTheDocument();
    expect(setCurrentBoardIdMock).toHaveBeenCalledWith('test-board-id');
    expect(fetchProjectsMock).toHaveBeenCalledWith('test-board-id');
  });
});
