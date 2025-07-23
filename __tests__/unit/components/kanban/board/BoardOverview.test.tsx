import { BoardOverview } from '@/components/kanban/BoardOverview';
import { useBoards } from '@/hooks/useBoards';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Board, Project } from '@/types/dbInterface';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { render, screen } from '../../../test-utils';

// --- Mocking Dependencies ---

// Mock useBoards hook
vi.mock('@/hooks/useBoards');
const mockUseBoards = useBoards as Mock;

// Mock next-intl
vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useTranslations: () => (key: string) => key
  };
});

// Mock i18n navigation
vi.mock('@/i18n/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
    toString: vi.fn(() => '')
  }))
}));
const mockUseRouter = useRouter as Mock;
const mockUsePathname = usePathname as Mock;

// Mock child components
vi.mock('@/components/kanban/board/BoardActions', () => ({
  BoardActions: vi.fn(({ board }) => (
    <div data-testid={`board-actions-${board._id}`}>Actions</div>
  ))
}));
vi.mock('@/components/kanban/board/NewBoardDialog', () => ({
  default: vi.fn(({ children }) => (
    <div data-testid="new-board-dialog">{children}</div>
  ))
}));

// Mock Shadcn Select components
vi.mock('@/components/ui/select', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/components/ui/select')>();
  return {
    ...original,
    Select: vi.fn(({ children, onValueChange, value }) => (
      <div data-testid="mock-select" data-current-value={value}>
        {children}
      </div>
    )),
    SelectTrigger: vi.fn(({ children, ...props }) => (
      <button {...props} role="combobox">
        {children}
      </button>
    )),
    SelectContent: vi.fn(({ children }) => (
      <div data-testid="mock-select-content">{children}</div>
    )),
    SelectItem: vi.fn(({ children, value, ...props }) => (
      <div
        data-testid={`mock-select-item-${value}`}
        data-value={value}
        {...props}
        onClick={() => (props as any).onSelect?.(value)}
      >
        {children}
      </div>
    )),
    SelectValue: vi.fn((props) => (
      <span data-testid="mock-select-value">{props.placeholder}</span>
    ))
  };
});

// --- Test Data ---
const mockMyBoard1: Board = {
  _id: 'my1',
  title: 'My Personal Board',
  description: 'My description',
  owner: { id: 'user1', name: 'Me' },
  members: [{ id: 'user1', name: 'Me' }],
  projects: [{ _id: 'p1', title: 'Project Alpha' } as Project],
  createdAt: new Date(),
  updatedAt: new Date()
};
const mockMyBoard2: Board = {
  _id: 'my2',
  title: 'My Secret Project',
  description: '',
  owner: { id: 'user1', name: 'Me' },
  members: [{ id: 'user1', name: 'Me' }],
  projects: [],
  createdAt: new Date(),
  updatedAt: new Date()
};
const mockTeamBoard1: Board = {
  _id: 'team1',
  title: 'Team Shared Board',
  description: 'Team description',
  owner: { id: 'user2', name: 'Alice' },
  members: [
    { id: 'user1', name: 'Me' },
    { id: 'user2', name: 'Alice' }
  ],
  projects: [{ _id: 'p2', title: 'Project Beta' } as Project],
  createdAt: new Date(),
  updatedAt: new Date()
};

// --- Test Suite ---

describe('BoardOverview Component', () => {
  let mockRouterPush: Mock;

  beforeEach(() => {
    vi.resetAllMocks();
    mockRouterPush = vi.fn();
    (useRouter as Mock).mockReturnValue({
      push: mockRouterPush
    });
    (usePathname as Mock).mockReturnValue('/boards');
    (useBoards as Mock).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: false,
      fetchBoards: vi.fn()
    });
  });

  it('should display loading state', () => {
    mockUseBoards.mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: true,
      fetchBoards: vi.fn()
    });
    render(<BoardOverview />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('should display "No boards found" messages when there are no boards', () => {
    render(<BoardOverview />);
    expect(screen.getByText('noBoardsFound')).toBeInTheDocument();
    expect(screen.getByText('noTeamBoardsFound')).toBeInTheDocument();
  });

  it('should render My Boards and Team Boards correctly', () => {
    mockUseBoards.mockReturnValue({
      myBoards: [mockMyBoard1],
      teamBoards: [mockTeamBoard1],
      loading: false,
      fetchBoards: vi.fn()
    });
    render(<BoardOverview />);

    // My Boards
    expect(screen.getByTestId('myBoardsTitle')).toHaveTextContent('myBoards');
    expect(screen.getByText(mockMyBoard1.title)).toBeInTheDocument();
    expect(screen.getByText(mockMyBoard1.description!)).toBeInTheDocument();
    expect(
      screen.getByTestId(`board-actions-${mockMyBoard1._id}`)
    ).toBeInTheDocument();

    // Team Boards
    expect(screen.getByTestId('teamBoardsTitle')).toHaveTextContent(
      'teamBoards'
    );
    expect(screen.getByText(mockTeamBoard1.title)).toBeInTheDocument();
    expect(
      screen.getByText(`${'owner'}: ${mockTeamBoard1.owner.name}`)
    ).toBeInTheDocument();
  });

  it('should filter boards based on search input', async () => {
    const user = userEvent.setup();
    mockUseBoards.mockReturnValue({
      myBoards: [mockMyBoard1, mockMyBoard2],
      teamBoards: [mockTeamBoard1],
      loading: false,
      fetchBoards: vi.fn()
    });
    render(<BoardOverview />);

    const searchInput = screen.getByPlaceholderText('searchBoards');
    await user.type(searchInput, 'Personal');

    expect(screen.getByText(mockMyBoard1.title)).toBeInTheDocument();
    expect(screen.queryByText(mockMyBoard2.title)).not.toBeInTheDocument();
    expect(screen.queryByText(mockTeamBoard1.title)).not.toBeInTheDocument();
  });

  it('should render the New Board button with translated text', () => {
    render(<BoardOverview />);
    expect(screen.getByTestId('new-board-dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'newBoard' })
    ).toBeInTheDocument();
  });

  it('should display "noDescription" when board description is empty', () => {
    mockUseBoards.mockReturnValue({
      myBoards: [mockMyBoard2], // Board with no description
      teamBoards: [],
      loading: false,
      fetchBoards: vi.fn()
    });
    render(<BoardOverview />);
    expect(screen.getByText('noDescription')).toBeInTheDocument();
  });
});
