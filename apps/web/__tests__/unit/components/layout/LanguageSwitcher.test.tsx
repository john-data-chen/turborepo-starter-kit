import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: (props: any) => (
    <button data-testid="button" {...props}>
      {props.children}
    </button>
  )
}));
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: (props: any) => (
    <div data-testid="dropdown-menu">{props.children}</div>
  ),
  DropdownMenuContent: (props: any) => (
    <div data-testid="dropdown-menu-content">{props.children}</div>
  ),
  DropdownMenuItem: (props: any) => (
    <div data-testid="dropdown-menu-item" onClick={props.onClick}>
      {props.children}
    </div>
  ),
  DropdownMenuTrigger: (props: any) => (
    <div data-testid="dropdown-menu-trigger">{props.children}</div>
  )
}));

// Mock i18n/navigation hooks
const mockReplace = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/en/boards'
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' })
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it('should render current locale on button', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByTestId('button')).toHaveTextContent('EN');
  });

  it('should show dropdown menu items', () => {
    render(<LanguageSwitcher />);
    const items = screen.getAllByTestId('dropdown-menu-item');
    expect(items[0]).toHaveTextContent('English');
    expect(items[1]).toHaveTextContent('Deutsch');
  });

  it('should call router.replace with correct locale when English is clicked', () => {
    render(<LanguageSwitcher />);
    const englishItem = screen.getAllByTestId('dropdown-menu-item')[0];
    fireEvent.click(englishItem);
    expect(mockReplace).toHaveBeenCalledWith('/boards', { locale: 'en' });
  });

  it('should call router.replace with correct locale when Deutsch is clicked', () => {
    render(<LanguageSwitcher />);
    const deutschItem = screen.getAllByTestId('dropdown-menu-item')[1];
    fireEvent.click(deutschItem);
    expect(mockReplace).toHaveBeenCalledWith('/boards', { locale: 'de' });
  });
});
