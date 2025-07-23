import NewProjectDialog from '@/components/kanban/project/NewProjectDialog';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Mock useTaskStore
const addProjectMock = vi.fn().mockResolvedValue('mock-project-id');
vi.mock('@/lib/store', () => ({
  useTaskStore: (selector: any) =>
    selector({
      addProject: addProjectMock
    })
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

// Mock toast
const { toastSuccessMock } = vi.hoisted(() => {
  return { toastSuccessMock: vi.fn() };
});
vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: vi.fn()
  }
}));

// Mock ProjectForm to allow submission
vi.mock('@/components/kanban/project/ProjectForm', () => ({
  ProjectForm: ({ onSubmit, children }: any) => (
    <form
      data-testid="mock-project-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title: 'Test Project', description: 'Test Description' });
      }}
    >
      {children}
    </form>
  )
}));

describe('NewProjectDialog', () => {
  it('should open dialog and submit new project', async () => {
    render(<NewProjectDialog />);
    // Open dialog
    fireEvent.click(screen.getByTestId('new-project-trigger'));
    await screen.findByTestId('new-project-dialog');

    // Check translated titles
    expect(screen.getByText('addNewProjectTitle')).toBeInTheDocument();
    expect(screen.getByText('addNewProjectDescription')).toBeInTheDocument();

    // Submit form (via the mocked ProjectForm)
    fireEvent.submit(screen.getByTestId('mock-project-form'));

    // Check mock calls and toast message
    await waitFor(() => {
      expect(addProjectMock).toHaveBeenCalledWith(
        'Test Project',
        'Test Description'
      );
    });

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('createSuccess');
    });
  });
});
