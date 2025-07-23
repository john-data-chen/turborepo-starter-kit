import { ProjectActions } from '@/components/kanban/project/ProjectAction';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Mock zustand store
const updateProjectMock = vi.fn();
const removeProjectMock = vi.fn();
const fetchProjectsMock = vi.fn();
vi.mock('@/lib/store', () => ({
  useTaskStore: (selector: any) =>
    selector({
      updateProject: updateProjectMock,
      removeProject: removeProjectMock,
      fetchProjects: fetchProjectsMock,
      currentBoardId: 'b1'
    })
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) =>
    values ? `${key} ${JSON.stringify(values)}` : key
}));

// Mock toast
// Use vi.hoisted to define mocks before vi.mock
const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock
  }
}));

// Mock ProjectForm
vi.mock('@/components/kanban/project/ProjectForm', () => ({
  ProjectForm: ({ onSubmit, children }: any) => (
    <form
      data-testid="mock-project-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title: 'Edited Title', description: 'Edited Desc' });
      }}
    >
      {children}
    </form>
  )
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  )
}));
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>
}));
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: any) => <div>{children}</div>,
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogCancel: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  )
}));
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onSelect, ...props }: any) => (
    <div
      role="menuitem"
      {...props}
      onClick={() => onSelect && onSelect(new Event('select'))}
    >
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr />
}));

// Mock fetch for permissions
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({ canEditProject: true, canDeleteProject: true })
  })
) as any;

describe('ProjectActions', () => {
  const baseProps = {
    id: 'p1',
    title: 'Project 1',
    description: 'desc'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dropdown menu button', () => {
    render(<ProjectActions {...baseProps} />);
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument();
  });

  it('should open edit dialog and handle successful submission', async () => {
    updateProjectMock.mockResolvedValue(undefined);
    render(<ProjectActions {...baseProps} />);

    fireEvent.click(screen.getByTestId('project-option-button'));
    fireEvent.click(screen.getByTestId('edit-project-button'));
    await screen.findByText('editProjectTitle');

    fireEvent.submit(screen.getByTestId('mock-project-form'));

    await waitFor(() => {
      expect(updateProjectMock).toHaveBeenCalledWith(
        'p1',
        'Edited Title',
        'Edited Desc'
      );
      expect(toastSuccessMock).toHaveBeenCalledWith('updateSuccess');
    });
  });

  it('should open delete dialog and handle successful deletion', async () => {
    render(<ProjectActions {...baseProps} />);

    fireEvent.click(screen.getByTestId('project-option-button'));
    fireEvent.click(screen.getByTestId('delete-project-button'));
    await screen.findByText('confirmDeleteTitle {"title":"Project 1"}');

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));

    await waitFor(() => {
      expect(removeProjectMock).toHaveBeenCalledWith('p1');
      expect(toastSuccessMock).toHaveBeenCalledWith(
        'deleteSuccess {"title":"Project 1"}'
      );
    });
  });

  it('should show error toast when edit fails', async () => {
    const error = new Error('Update failed');
    updateProjectMock.mockRejectedValue(error);
    render(<ProjectActions {...baseProps} />);

    fireEvent.click(screen.getByTestId('project-option-button'));
    fireEvent.click(screen.getByTestId('edit-project-button'));
    await screen.findByText('editProjectTitle');

    fireEvent.submit(screen.getByTestId('mock-project-form'));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        `updateFailed {"error":"${error.message}"}`
      );
    });
  });
});
