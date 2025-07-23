import { useTaskForm } from '@/hooks/useTaskForm';
import { TaskFormSchema } from '@/types/taskForm';
import { act, renderHook, waitFor } from '@testing-library/react';
import { UseFormReturn } from 'react-hook-form';
import { vi } from 'vitest';
import { z } from 'zod';

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  }
}));

describe('useTaskForm Hook', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const setup = (defaultValues?: Partial<z.infer<typeof TaskFormSchema>>) =>
    renderHook(() => useTaskForm({ defaultValues, onSubmit: mockOnSubmit }));

  it('should initialize with default values', () => {
    const defaultValues = { title: 'Initial Title' };
    const { result } = setup(defaultValues);
    expect(result.current.form.getValues().title).toBe('Initial Title');
  });

  it('should initialize with custom values', () => {
    const defaultValues = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'IN_PROGRESS' as const,
      dueDate: new Date('2024-01-01'),
      assignee: { _id: 'user1', name: 'User One' }
    };

    const { result } = setup(defaultValues);

    expect(result.current.form.getValues()).toEqual(defaultValues);
  });

  it('should handle user search', async () => {
    const users = [{ _id: '1', name: 'User One' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users })
    });

    const { result } = setup();

    act(() => {
      result.current.setAssignOpen(true);
    });

    act(() => {
      result.current.setSearchQuery('test');
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/users/search?username=test');
      expect(result.current.users).toEqual(users);
      expect(result.current.isSearching).toBe(false);
    });
  });

  it('should handle search error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Search failed'));
    const { result } = setup();

    act(() => {
      result.current.setAssignOpen(true);
    });

    act(() => {
      result.current.setSearchQuery('error');
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error searching users:',
        expect.any(Error)
      );
      expect(result.current.isSearching).toBe(false);
    });
  });

  it('should handle form submission successfully', async () => {
    const { result } = setup({ title: 'New Task' });
    const { form, handleSubmit } = result.current;

    const submitData = { title: 'New Task', description: 'Task Description' };

    await act(async () => {
      // Manually set values and then submit
      form.setValue('description', 'Task Description');
      await form.handleSubmit(handleSubmit)();
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining(submitData)
    );
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle form submission error', async () => {
    const error = new Error('Submit Error');
    mockOnSubmit.mockRejectedValueOnce(error);

    const { result } = setup();

    const submitData = {
      title: 'New Task',
      description: 'Task Description',
      status: 'TODO' as const
    };

    await act(async () => {
      await result.current.handleSubmit(submitData);
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('should debounce search queries', async () => {
    vi.useFakeTimers();
    const { result } = setup();

    // Mock fetch responses
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [] })
      } as Response);

    // First API call when opening assign user panel
    act(() => {
      result.current.setAssignOpen(true);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Reset mock to check debounce behavior
    vi.mocked(global.fetch).mockReset();

    // Multiple search queries in quick succession
    act(() => {
      result.current.setSearchQuery('test1');
      result.current.setSearchQuery('test2');
      result.current.setSearchQuery('test3');
    });

    // Fast-forward to complete the debounce timeout
    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    // Should only make one API call with the last search value
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/users/search?username=test3'
    );

    vi.useRealTimers();
  });

  it('should handle form submission without default values', async () => {
    const { result } = setup();
    act(() => {
      result.current.handleSubmit({
        title: 'Test Task',
        description: 'A task without defaults',
        status: 'TODO',
        assignee: { _id: 'user3', name: 'John Smith' }
      });
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          status: 'TODO',
          assignee: { _id: 'user3', name: 'John Smith' }
        })
      );
    });
  });
});
