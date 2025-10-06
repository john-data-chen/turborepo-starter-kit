import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: '.',
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['./__tests__/units/**/*.test.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        './__tests__/e2e/**/*.test.{ts,tsx}',
        'src/components/ui/**/*',
        'src/hooks/use-mobile.ts',
        'src/types/**/*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@repo/ui': path.resolve(__dirname, '../../packages/ui/src')
    }
  }
})
