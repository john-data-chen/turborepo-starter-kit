import ThemeToggle from '@/components/layout/ThemeToggle';
import userEvent from '@testing-library/user-event';
import { useTheme } from 'next-themes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../test-utils';

vi.mock('next-themes', () => ({
  useTheme: vi.fn()
}));

vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useTranslations: () => (key: string) => key
  };
});

describe('ThemeToggle Component', () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Provide a default mock implementation for useTheme
    vi.mocked(useTheme).mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'system',
      themes: ['light', 'dark', 'system']
    });
  });

  it('should render the toggle button', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: 'toggleTheme' })
    ).toBeInTheDocument();
  });

  it('should open the dropdown menu on button click and show theme options', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: 'toggleTheme' });

    await user.click(toggleButton);

    expect(
      await screen.findByRole('menuitem', { name: 'light' })
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'dark' })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'system' })
    ).toBeInTheDocument();
  });

  it('should call setTheme with "light" when Light menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: 'toggleTheme' });

    await user.click(toggleButton);

    const lightMenuItem = await screen.findByRole('menuitem', {
      name: 'light'
    });
    await user.click(lightMenuItem);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should call setTheme with "dark" when Dark menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: 'toggleTheme' });

    await user.click(toggleButton);

    const darkMenuItem = await screen.findByRole('menuitem', { name: 'dark' });
    await user.click(darkMenuItem);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme with "system" when System menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: 'toggleTheme' });

    await user.click(toggleButton);

    const systemMenuItem = await screen.findByRole('menuitem', {
      name: 'system'
    });
    await user.click(systemMenuItem);

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});
