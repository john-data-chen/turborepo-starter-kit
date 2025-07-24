import AuthLayout from '@/app/[locale]/(auth)/layout';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

// Mock Toaster component
vi.mock('@/components/ui/sonner', () => ({
  Toaster: (props: any) => <div data-testid="toaster" {...props} />
}));

describe('AuthLayout', () => {
  it('should render children and Toaster', () => {
    render(
      <AuthLayout>
        <div data-testid="child">Child Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('should pass correct props to Toaster', () => {
    render(
      <AuthLayout>
        <div />
      </AuthLayout>
    );
    const toaster = screen.getByTestId('toaster');
    expect(toaster).toHaveAttribute('position', 'bottom-right');
    expect(toaster).toHaveAttribute('visibleToasts', '1');
  });
});
