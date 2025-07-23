import { TaskForm } from '@/components/kanban/task/TaskForm';
import { useTaskForm } from '@/hooks/useTaskForm';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// --- Global Mocks ---
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// --- Vitest Mocks ---
vi.mock('@/hooks/useTaskForm');
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

// Mock react-hook-form's Controller to avoid issues with its internal state
// in a testing environment. It simply renders the child component with basic field props.
vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    Controller: ({ render }: any) =>
      render({
        field: {
          name: 'mocked-controller-field',
          value: '',
          onChange: vi.fn(),
          onBlur: vi.fn(),
          ref: React.createRef()
        },
        fieldState: { invalid: false, error: null }
      })
  };
});

const mockOnCancel = vi.fn();
const mockOnSubmit = vi.fn();
const mockSetSearchQuery = vi.fn();

// This is the actual submit handler logic that we expect to be called.
const mockSubmitLogic = vi.fn((values) => Promise.resolve());

// --- Test Suite ---
describe('TaskForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // This mock simulates the `handleSubmit` provided by `react-hook-form`'s `useForm` hook.
    // It's a higher-order function.
    const formHandleSubmitMock = vi.fn(
      (submitCallback) => (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        // When the form is submitted, it calls the handler that was passed to it.
        submitCallback({
          /* mock form data */
        });
      }
    );

    vi.mocked(useTaskForm).mockReturnValue({
      // Provide a mock `form` object that includes the mocked `handleSubmit`
      form: {
        handleSubmit: formHandleSubmitMock,
        control: {
          _subscribe: () => {}
        }, // Placeholder for form.control
        getFieldState: () => ({
          invalid: false,
          isDirty: false,
          isTouched: false,
          error: undefined
        })
      } as any,
      // This is the function that gets passed INTO form.handleSubmit inside the component
      handleSubmit: mockSubmitLogic,
      isSubmitting: false,
      users: [],
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      isSearching: false,
      assignOpen: false,
      setAssignOpen: vi.fn()
    });
  });

  it('renders all form fields with translated labels and placeholders', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Use placeholder text for query, which is more robust
    expect(screen.getByPlaceholderText('titlePlaceholder')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('descriptionPlaceholder')
    ).toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls the submit logic from the hook when the form is submitted', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = screen.getByTestId('submit-task-button');
    act(() => {
      fireEvent.click(submitButton);
    });

    // The component calls form.handleSubmit(handleSubmit), so our mock for the
    // submit logic should have been called.
    expect(mockSubmitLogic).toHaveBeenCalled();
  });

  it('uses the provided submitLabel for the submit button', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="update"
      />
    );
    expect(screen.getByRole('button', { name: 'update' })).toBeInTheDocument();
  });
});
