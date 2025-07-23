import NewTaskDialog from '@/components/kanban/task/NewTaskDialog';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock zustand store
const mockAddTask = vi.fn();
vi.mock('@/lib/store', () => ({
  useTaskStore: (selector: (state: any) => any) =>
    selector({
      addTask: mockAddTask
    })
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) =>
    values ? `${key} ${JSON.stringify(values)}` : key
}));

// Mock TaskForm
vi.mock('@/components/kanban/task/TaskForm', () => ({
  TaskForm: ({ onSubmit, onCancel, submitLabel }: any) => (
    <form
      data-testid="mock-task-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title: 'Test Task',
          status: 'TODO'
        });
      }}
    >
      <button type="submit">{submitLabel}</button>
      <button type="button" onClick={onCancel}>
        cancel
      </button>
    </form>
  )
}));

// Mock UI components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, onOpenChange }: any) => (
    <div onClick={() => onOpenChange(true)} data-testid="mock-dialog-wrapper">
      {children}
    </div>
  ),
  DialogTrigger: ({ children }: any) => <>{children}</>,
  DialogContent: ({ children }: any) => (
    <div data-testid="new-task-dialog">{children}</div>
  ),
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>
}));

describe('NewTaskDialog', () => {
  const projectId = 'p1';

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddTask.mockResolvedValue(undefined);
  });

  it('should render trigger button with translated text', () => {
    render(<NewTaskDialog projectId={projectId} />);
    expect(screen.getByTestId('new-task-trigger')).toHaveTextContent(
      'addNewTask'
    );
  });

  it('should open dialog and display translated headers', async () => {
    render(<NewTaskDialog projectId={projectId} />);
    await userEvent.click(screen.getByTestId('new-task-trigger'));

    expect(await screen.findByTestId('new-task-dialog')).toBeInTheDocument();
    expect(screen.getByText('addNewTaskTitle')).toBeInTheDocument();
    expect(screen.getByText('addNewTaskDescription')).toBeInTheDocument();
  });

  it('should call addTask and show success toast on submit', async () => {
    render(<NewTaskDialog projectId={projectId} />);
    await userEvent.click(screen.getByTestId('new-task-trigger'));

    const submitButton = await screen.findByRole('button', {
      name: 'createTask'
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith(
        'p1',
        'Test Task',
        'TODO',
        '',
        undefined,
        undefined
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'createSuccess {"title":"Test Task"}'
      );
    });
  });
});
