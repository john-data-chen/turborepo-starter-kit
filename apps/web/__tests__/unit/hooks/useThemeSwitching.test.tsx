import useThemeSwitching from '@/hooks/useThemeSwitching';
import { act, renderHook } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { describe, expect, it, vi } from 'vitest';

// Mock next-themes and next-intl
vi.mock('next-themes', () => ({
  useTheme: vi.fn()
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key)
}));

describe('useThemeSwitching Hook', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      themes: ['light', 'dark']
    });
  });

  it('should initialize with theme from useTheme', () => {
    const { result } = renderHook(() => useThemeSwitching());

    expect(result.current.theme).toBe('light');
    expect(result.current.themeAction).toHaveLength(3);
    expect(useTranslations).toHaveBeenCalledWith('theme');
  });

  it('should toggle theme correctly from light to dark', () => {
    const setTheme = vi.fn();

    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme,
      themes: ['light', 'dark']
    });

    const { result } = renderHook(() => useThemeSwitching());

    act(() => {
      const toggleAction = result.current.themeAction.find(
        (action) => action.id === 'toggleTheme'
      );
      toggleAction?.perform();
    });

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('should toggle theme correctly from dark to light', () => {
    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme,
      themes: ['light', 'dark']
    });

    const { result } = renderHook(() => useThemeSwitching());

    act(() => {
      const toggleAction = result.current.themeAction.find(
        (action) => action.id === 'toggleTheme'
      );
      toggleAction?.perform();
    });

    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('should set light theme', () => {
    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme,
      themes: ['light', 'dark']
    });

    const { result } = renderHook(() => useThemeSwitching());

    act(() => {
      const setLightAction = result.current.themeAction.find(
        (action) => action.id === 'setLightTheme'
      );
      setLightAction?.perform();
    });

    expect(setTheme).toHaveBeenCalledWith('light');
  });

  it('should set dark theme', () => {
    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme,
      themes: ['light', 'dark']
    });

    const { result } = renderHook(() => useThemeSwitching());

    act(() => {
      const setDarkAction = result.current.themeAction.find(
        (action) => action.id === 'setDarkTheme'
      );
      setDarkAction?.perform();
    });

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('should return correct theme actions structure with translation keys', () => {
    const { result } = renderHook(() => useThemeSwitching());

    expect(result.current.themeAction).toEqual([
      {
        id: 'toggleTheme',
        name: 'toggleTheme',
        section: 'Theme',
        perform: expect.any(Function)
      },
      {
        id: 'setLightTheme',
        name: 'light',
        section: 'Theme',
        perform: expect.any(Function)
      },
      {
        id: 'setDarkTheme',
        name: 'dark',
        section: 'Theme',
        perform: expect.any(Function)
      }
    ]);
  });
});
