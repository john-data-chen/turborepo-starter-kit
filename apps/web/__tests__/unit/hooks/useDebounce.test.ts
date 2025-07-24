import { useDebounce } from '@/hooks/useDebounce';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial value'));
    expect(result.current).toBe('initial value');
  });

  it('should debounce value updates with default delay', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' }
    });

    // Initial value should be set immediately
    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated' });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward default delay (500ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Value should be updated after delay
    expect(result.current).toBe('updated');
  });

  it('should debounce value updates with custom delay', () => {
    const customDelay = 1000;
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, customDelay),
      {
        initialProps: { value: 'initial' }
      }
    );

    // Update the value
    rerender({ value: 'updated' });

    // Value should not change before delay
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // Value should change after full delay
    act(() => {
      vi.advanceTimersByTime(500); // Total 1000ms
    });
    expect(result.current).toBe('updated');
  });

  it('should handle multiple rapid updates', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' }
    });

    // Multiple rapid updates
    rerender({ value: 'update1' });
    rerender({ value: 'update2' });
    rerender({ value: 'update3' });

    // Should still have initial value
    expect(result.current).toBe('initial');

    // After delay, should have final value
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('update3');
  });

  it('should cleanup timeout on unmount', () => {
    const { unmount } = renderHook(() => useDebounce('test'));
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
