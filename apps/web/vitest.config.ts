import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['apps/web/src/**/*.{ts,tsx}'],
      exclude: [
        'apps/web/src/**/*.d.ts',
        'apps/web/__tests__/**/*.test.{ts,tsx}',
        'apps/web/src/components/ui/**/*',
        'apps/web/src/hooks/use-mobile.ts',
        'apps/web/src/types/**/*'
      ]
    }
  }
})
