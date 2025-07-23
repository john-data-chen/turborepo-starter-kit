import SignInViewPage from '@/components/auth/SignInView';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock child components
vi.mock('@/components/auth/UserAuthForm', () => ({
  default: () => (
    <div data-testid="mock-user-auth-form">Mock User Auth Form</div>
  )
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

// Mock the lucide-react Presentation icon
vi.mock('lucide-react', async (importOriginal) => {
  const original = await importOriginal<typeof import('lucide-react')>();
  return {
    ...original,
    Presentation: () => <svg data-testid="mock-presentation-icon" />
  };
});

describe('SignInView Component', () => {
  it('should render all child components and translated text keys', () => {
    render(<SignInViewPage />);

    // Check for translated text keys
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.getByText('formHint')).toBeInTheDocument();

    // Check for mocked components
    expect(screen.getByTestId('mock-user-auth-form')).toBeInTheDocument();
    expect(screen.getByTestId('mock-presentation-icon')).toBeInTheDocument();
  });
});
