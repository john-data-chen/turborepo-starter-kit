import RootWrapper from '@/components/layout/RootWrapper';
import { useIsMobile } from '@/hooks/use-mobile';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock child components and hooks
vi.mock('@/components/layout/AppSidebar', () => ({
  default: () => <div data-testid="mock-app-sidebar">Mock AppSidebar</div>
}));

vi.mock('@/components/layout/Header', () => ({
  default: () => <div data-testid="mock-header">Mock Header</div>
}));

// Mock SidebarProvider and SidebarInset if they cause issues,
// but often wrapping is enough for context.
// For simplicity, we assume they render children correctly.
vi.mock('@/components/ui/sidebar', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/components/ui/sidebar')>();
  return {
    ...actual,
    SidebarProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-sidebar-provider">{children}</div>
    ),
    SidebarInset: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-sidebar-inset">{children}</div>
    )
  };
});

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn()
}));

describe('RootWrapper Component', () => {
  const childText = 'Test Child Content';
  const ChildComponent = () => <div>{childText}</div>;

  it('should render children and core layout components', () => {
    vi.mocked(useIsMobile).mockReturnValue(false); // Default to non-mobile

    render(
      <RootWrapper>
        <ChildComponent />
      </RootWrapper>
    );

    // Check if children are rendered
    expect(screen.getByText(childText)).toBeInTheDocument();

    // Check if mocked layout components are rendered
    expect(screen.getByTestId('mock-app-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar-inset')).toBeInTheDocument();
  });
});
