import getRequestConfig from '@/i18n/request';
import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('next-intl', () => ({
  hasLocale: vi.fn()
}));
vi.mock('next-intl/server', () => ({
  getRequestConfig: (fn: any) => fn
}));
vi.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'de'],
    defaultLocale: 'en'
  }
}));

// Mock dynamic import for messages
vi.stubGlobal('import', (path: string) => {
  return Promise.resolve({
    default: {
      metadata: {
        title: 'Next Project Manager',
        description: 'Next.js template for beginner'
      },
      kanban: { title: 'Kanban Overview' }
    }
  });
});

describe('getRequestConfig', () => {
  it('should return messages with kanban.title for supported locale', async () => {
    vi.mocked(hasLocale).mockReturnValue(true);

    const config = await getRequestConfig({
      requestLocale: Promise.resolve('en')
    });
    const messages = config.messages?.default ?? config.messages;
    expect(messages).toHaveProperty('kanban.title', 'Kanban Overview');
    expect(config.locale).toBe('en');
  });

  it('should fallback to defaultLocale if locale not supported', async () => {
    vi.mocked(hasLocale).mockReturnValue(false);

    const config = await getRequestConfig({
      requestLocale: Promise.resolve('fr')
    });
    const messages = config.messages?.default ?? config.messages;
    expect(messages).toHaveProperty('kanban.title', 'Kanban Overview');
    expect(config.locale).toBe(routing.defaultLocale);
  });
});
