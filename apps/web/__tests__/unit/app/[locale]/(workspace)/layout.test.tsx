import AppLayout from '@/app/[locale]/(workspace)/layout';
import { ROUTES } from '@/constants/routes';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock server-only modules
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key)
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn()
}));
vi.mock('next/navigation', async (importOriginal) => {
  const original = await importOriginal<typeof import('next/navigation')>();
  return {
    ...original,
    redirect: vi.fn()
  };
});
vi.mock('@/components/layout/RootWrapper', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="root-wrapper">{children}</div>
  )
}));

describe('AppLayout', () => {
  const mockParams = { locale: 'en' };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login if no session', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue(null);

    // @ts-ignore
    await AppLayout({ children: <div>Test</div>, params: mockParams });
    expect(redirect).toHaveBeenCalledWith(ROUTES.AUTH.LOGIN);
  });

  it('should render children if session exists', async () => {
    const { auth } = await import('@/lib/auth');
    (auth as any).mockResolvedValue({ user: { id: '1' } });

    // Render the async component and await its result
    const result = await AppLayout({
      children: <div>Test</div>,
      params: mockParams
    });
    render(result);

    expect(screen.getByTestId('root-wrapper')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
