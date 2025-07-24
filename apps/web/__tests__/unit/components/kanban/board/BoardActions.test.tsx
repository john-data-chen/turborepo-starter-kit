import { BoardActions } from '@/components/kanban/board/BoardActions';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// --- Mocks for hooks and store ---
// Mock useTaskStore
const updateBoardMock = vi.fn().mockResolvedValue(undefined);
const removeBoardMock = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/store', () => ({
  useTaskStore: () => ({
    updateBoard: updateBoardMock,
    removeBoard: removeBoardMock
  })
}));

// Mock useBoards
const fetchBoardsMock = vi.fn();
vi.mock('@/hooks/useBoards', () => ({
  useBoards: () => ({
    fetchBoards: fetchBoardsMock
  })
}));

// Mock useRouter
const refreshMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) =>
    values ? `${key} ${JSON.stringify(values)}` : key
}));

// --- Mock sonner (toast) using vi.hoisted ---
const toastMocks = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: toastMocks.toastSuccessMock, // Reference hoisted mock
    error: toastMocks.toastErrorMock // Reference hoisted mock
  }
}));

// Mock BoardForm
vi.mock('@/components/kanban/board/BoardForm', () => ({
  BoardForm: ({
    onSubmit,
    children,
    defaultValues
  }: {
    onSubmit: (values: { title: string; description: string }) => void;
    children: React.ReactNode;
    defaultValues: { title: string; description: string };
  }) => (
    <form
      data-testid="board-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title: 'Edited Title', description: 'Edited Desc' });
      }}
    >
      <input
        defaultValue={defaultValues.title}
        data-testid="board-title-input"
      />
      <textarea
        defaultValue={defaultValues.description}
        data-testid="board-description-input"
      />
      {/* Pass children through, assuming the actual component renders the submit button */}
      {children}
    </form>
  )
}));

// --- Mock DropdownMenu Components ---
vi.mock('@/components/ui/dropdown-menu', async (importOriginal) => {
  // Dynamically import the original module to get its type and potentially other exports
  const original =
    await importOriginal<typeof import('@/components/ui/dropdown-menu')>();
  return {
    ...original,
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DropdownMenuItem: ({
      children,
      onSelect,
      ...props
    }: {
      children: React.ReactNode;
      onSelect?: (event: Event) => void;
      [key: string]: any;
    }) => (
      <button {...props} onClick={(e) => onSelect?.(e as unknown as Event)}>
        {children}
      </button>
    ),
    DropdownMenuSeparator: () => <hr data-testid="mock-separator" />
  };
});

describe('BoardActions', () => {
  const board = {
    _id: 'b1',
    title: 'Test Board',
    description: 'desc',
    owner: { id: 'u1', name: 'User1' },
    members: [],
    projects: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks(); // This clears all mocks, including hoisted ones
  });

  // Test for opening edit dialog
  it('should open edit dialog when edit item is clicked', async () => {
    render(<BoardActions board={board} />);
    const editButton = screen.getByTestId('edit-board-button');
    fireEvent.click(editButton);

    await screen.findByText('editBoardTitle');
    expect(screen.getByText('editBoardDescription')).toBeInTheDocument();

    // Assuming BoardForm mock doesn't render the button,
    // we need to find the button rendered by the actual DialogFooter inside BoardActions
    const saveButton = screen.getByRole('button', { name: 'saveChanges' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateBoardMock).toHaveBeenCalledWith('b1', {
        title: 'Edited Title',
        description: 'Edited Desc'
      });
      expect(toastMocks.toastSuccessMock).toHaveBeenCalledWith(
        'boardUpdated {"title":"Edited Title"}'
      );
      expect(fetchBoardsMock).toHaveBeenCalled();
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  // Test for opening delete dialog
  it('should open delete dialog when delete item is clicked', async () => {
    render(<BoardActions board={board} />);
    const deleteButtonDropdown = screen.getByTestId('delete-board-button');
    fireEvent.click(deleteButtonDropdown);

    await screen.findByText('confirmDeleteTitle {"title":"Test Board"}');
    expect(screen.getByText('confirmDeleteDescription')).toBeInTheDocument();

    // Find the delete button within the AlertDialog
    const confirmDeleteButton = screen.getByRole('button', { name: 'delete' });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(removeBoardMock).toHaveBeenCalledWith('b1');
      expect(toastMocks.toastSuccessMock).toHaveBeenCalledWith('boardDeleted');
      expect(fetchBoardsMock).toHaveBeenCalled();
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  // Test for update failure
  it('should show error toast if updateBoard fails', async () => {
    const error = new Error('Update failed');
    updateBoardMock.mockRejectedValueOnce(error);
    render(<BoardActions board={board} />);

    const editButton = screen.getByTestId('edit-board-button');
    fireEvent.click(editButton);

    await screen.findByText('editBoardTitle');
    const saveButton = screen.getByRole('button', { name: 'saveChanges' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toastMocks.toastErrorMock).toHaveBeenCalledWith(
        `boardUpdateFailed {"error":"${String(error)}"}`
      );
    });
  });

  // Test for delete failure
  it('should show error toast if removeBoard fails', async () => {
    const error = new Error('Delete failed');
    removeBoardMock.mockRejectedValueOnce(error);
    render(<BoardActions board={board} />);

    const deleteButtonDropdown = screen.getByTestId('delete-board-button');
    fireEvent.click(deleteButtonDropdown);

    await screen.findByText('confirmDeleteTitle {"title":"Test Board"}');
    const confirmDeleteButton = screen.getByRole('button', { name: 'delete' });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(toastMocks.toastErrorMock).toHaveBeenCalledWith(
        `boardDeleteFailed {"error":"${String(error)}"}`
      );
    });
  });
});
