import LocaleLayout, { generateMetadata } from '@/app/[locale]/layout';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@/components/layout/Providers', () => ({
  default: ({ children }: any) => <div data-testid="providers">{children}</div>
}));
vi.mock('@/i18n/routing', () => ({
  routing: { locales: ['en', 'de'], defaultLocale: 'en' }
}));
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { name: 'Test User' } }))
}));
vi.mock('next-intl', () => ({
  hasLocale: vi.fn((locales, locale) => locales.includes(locale)),
  NextIntlClientProvider: ({ children }: any) => (
    <div data-testid="intl">{children}</div>
  )
}));
vi.mock('next-intl/server', () => ({
  getMessages: vi.fn(() => Promise.resolve({ test: 'message' })),
  getTranslations: vi.fn(() =>
    Promise.resolve((key: string) => {
      if (key === 'title') return 'Test Title';
      if (key === 'description') return 'Test Description';
      return key;
    })
  )
}));
vi.mock('next/font/google', () => ({
  Roboto: vi.fn(() => ({ className: 'roboto' }))
}));
vi.mock('next/navigation', () => ({
  notFound: vi.fn()
}));
vi.mock('nextjs-toploader', () => ({
  default: () => <div data-testid="toploader" />
}));
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="analytics" />
}));
vi.mock('@/styles/globals.css', () => ({}));

describe('LocaleLayout', () => {
  it('should render layout with children and providers', async () => {
    const children = <div data-testid="child">Child Content</div>;
    const params = { locale: 'en' };
    const Layout = await LocaleLayout({ children, params });

    // Render the returned JSX
    render(Layout as React.ReactElement);

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('providers')).toBeInTheDocument();
    expect(screen.getByTestId('intl')).toBeInTheDocument();
    expect(screen.getByTestId('toploader')).toBeInTheDocument();
    expect(screen.getByTestId('analytics')).toBeInTheDocument();
  });

  it('should call notFound if locale is not supported', async () => {
    const { notFound } = await import('next/navigation');
    const params = { locale: 'fr' };
    await LocaleLayout({ children: <div />, params });
    expect(notFound).toHaveBeenCalled();
  });
});

describe('generateMetadata', () => {
  it('should generate metadata with correct title and description', async () => {
    const params = { locale: 'en' };
    const metadata = await generateMetadata({ params });
    expect(metadata.title).toBe('Test Title');
    expect(metadata.description).toBe('Test Description');
  });
});
