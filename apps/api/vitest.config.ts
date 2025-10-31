import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'apps/web/__tests__/e2e/**', 'apps/api/database/**', 'packages'],
    setupFiles: ['../../vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/database/**',
        '**/__tests__/**',
        '**/dist/**',
        '**/.turbo/**',
        '**/.next/**',
        '**/coverage/**',
        '**/packages/**',
        'src/**/*.d.ts',
        'src/main.ts',
        'src/**/*.module.ts',
        'src/**/decorators/**',
        'src/**/guards/**/*.guard.ts',
        'src/**/strategies/email.strategy.ts'
      ],
      thresholds: {
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@api': 'apps/api/src',
      '@web': 'apps/web/src'
    }
  }
})
