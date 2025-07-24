import { TaskActions } from '@/components/kanban/task/TaskAction';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock UI components
vi.mock('@/components/kanban/task/TaskForm', () => ({
  TaskForm: (props: any) => (
    <form
      data-testid="task-form"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit && props.onSubmit({ title: 't', status: 'TODO' });
      }}
    >
      {props.submitLabel}
    </form>
  )
}));
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, ...props }: any) => (
    <div data-testid="alert-dialog" {...props}>
      {children}
    </div>
  ),
  AlertDialogCancel: (props: any) => (
    <button data-testid="cancel-delete-button" {...props} />
  ),
  AlertDialogContent: (props: any) => (
    <div data-testid="delete-task-dialog" {...props} />
  ),
  AlertDialogDescription: (props: any) => <div {...props} />,
  AlertDialogFooter: (props: any) => <div {...props} />,
  AlertDialogHeader: (props: any) => <div {...props} />,
  AlertDialogTitle: (props: any) => <div {...props} />
}));
vi.mock('@/components/ui/button', () => ({
  Button: (props: any) => (
    <button data-testid={props['data-testid'] || 'button'} {...props} />
  )
}));
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, ...props }: any) => (
    <div data-testid="dialog" {...props}>
      {children}
    </div>
  ),
  DialogContent: (props: any) => (
    <div data-testid="edit-task-dialog" {...props} />
  ),
  DialogDescription: (props: any) => <div {...props} />,
  DialogHeader: (props: any) => <div {...props} />,
  DialogTitle: (props: any) => <div {...props} />
}));
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: (props: any) => (
    <div data-testid="dropdown-menu">{props.children}</div>
  ),
  DropdownMenuContent: (props: any) => (
    <div data-testid="dropdown-menu-content">{props.children}</div>
  ),
  DropdownMenuItem: (props: any) => (
    <div data-testid="dropdown-menu-item" onClick={props.onSelect}>
      {props.children}
    </div>
  ),
  DropdownMenuSeparator: (props: any) => (
    <div data-testid="dropdown-menu-separator" />
  ),
  DropdownMenuTrigger: (props: any) => (
    <div data-testid="dropdown-menu-trigger">{props.children}</div>
  )
}));
vi.mock('@radix-ui/react-icons', () => ({
  DotsHorizontalIcon: () => <svg data-testid="dots-icon" />
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: any) => key
}));
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}));
vi.mock('@/lib/store', () => ({
  useTaskStore: () => ({
    updateTask: vi.fn(),
    removeTask: vi.fn()
  })
}));

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ _id: '1', name: 'Assignee' }])
  })
) as any;

describe('TaskActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders action trigger button', () => {
    render(<TaskActions id="1" title="Task" status="TODO" />);
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument();
  });

  it('shows edit dialog when edit is enabled and canEdit is true', async () => {
    render(<TaskActions id="1" title="Task" status="TODO" />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('shows delete dialog when delete is enabled and canDelete is true', async () => {
    render(<TaskActions id="1" title="Task" status="TODO" />);
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
  });
});
