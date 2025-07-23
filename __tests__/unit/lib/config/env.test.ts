import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('dotenv', () => ({
  config: vi.fn().mockReturnValue({ error: null })
}));

vi.mock('path', () => ({
  resolve: vi.fn().mockReturnValue('/path/to/.env'),
  default: { resolve: vi.fn().mockReturnValue('/path/to/.env') }
}));

describe('Environment Configuration', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use provided DATABASE_URL', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('DATABASE_URL', 'test-db-url');

    const { config } = await import('@/lib/config/env');
    expect(config.databaseUrl).toBe('test-db-url');
  });

  it('should have correct environment flags in test environment', async () => {
    vi.stubEnv('NODE_ENV', 'test');

    const { config } = await import('@/lib/config/env');
    expect(config.isTest).toBe(true);
    expect(config.isProduction).toBe(false);
    expect(config.isDevelopment).toBe(false);
  });

  it('should have correct environment flags in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const { config } = await import('@/lib/config/env');
    expect(config.isTest).toBe(false);
    expect(config.isProduction).toBe(true);
    expect(config.isDevelopment).toBe(false);
  });

  it('should use default values when environment variables are not set', async () => {
    vi.stubEnv('NODE_ENV', 'test');

    const { config } = await import('@/lib/config/env');
    expect(config.appName).toBe('Next.js App');
    expect(config.baseUrl).toBe('http://localhost:3000');
    expect(config.enableAnalytics).toBe(false);
    expect(config.debug).toBe(false);
  });

  it('should throw error when DATABASE_URL is missing in non-production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DATABASE_URL', '');

    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(import('@/lib/config/env')).rejects.toThrow(
      'Local development DATABASE_URL is not defined'
    );

    expect(mockError).toHaveBeenCalled();
    mockError.mockRestore();
  });

  it('should not throw when DATABASE_URL is missing in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', '');

    const { config } = await import('@/lib/config/env');
    expect(config.databaseUrl).toBe('');
  });
});
