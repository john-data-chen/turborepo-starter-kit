import Providers from '@/components/layout/Providers';
import { render, screen } from '@testing-library/react';
import { Session } from 'next-auth';
// Import Session type
import React from 'react';
import { describe, expect, it } from 'vitest';

// Mock next-themes ThemeProvider as it might interfere with testing environment
// or require specific setup if not mocked.
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  )
}));

// SessionProvider from next-auth/react usually works fine in tests
// but requires a session object.

describe('Providers Component', () => {
  const childText = 'Test Child Component';
  const ChildComponent = () => <div>{childText}</div>;

  // Create a mock session object satisfying the Session type
  const mockSession: Session | null = {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      id: 'test-user-id' // Assuming your Session['user'] includes id
    },
    expires: new Date(Date.now() + 2 * 86400).toISOString() // Example expiry
  };

  it('should render children wrapped by ThemeProvider and SessionProvider', () => {
    render(
      <Providers session={mockSession}>
        <ChildComponent />
      </Providers>
    );

    // Check if the child component is rendered
    expect(screen.getByText(childText)).toBeInTheDocument();

    // Check if the mocked ThemeProvider is rendered (optional, but good for verification)
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();

    // Implicitly checks SessionProvider by ensuring children render without context errors
  });

  it('should handle null session correctly', () => {
    render(
      <Providers session={null}>
        <ChildComponent />
      </Providers>
    );

    // Check if the child component is rendered even with null session
    expect(screen.getByText(childText)).toBeInTheDocument();
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });
});
