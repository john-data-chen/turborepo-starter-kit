import AuthLayout from '@/app/[locale]/(auth)/layout';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

describe('AuthLayout', () => {
  it('should render children', () => {
    render(
      <AuthLayout>
        <div data-testid="child">Child Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
