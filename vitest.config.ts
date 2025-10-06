import path from 'path'
import react from '@vitejs/plugin-react-swc'
import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), swc.vite()],
  test: {
    globals: true,
    include: ['apps/api/**/*.test.{ts,tsx}', 'apps/web/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'apps/web/__tests__/e2e/**', 'apps/api/database/**', 'packages'],
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@api': path.resolve(__dirname, './apps/api/src'),
      '@web': path.resolve(__dirname, './apps/web/src')
    },
    deps: {
      optimizer: {
        web: {
          include: ['next-intl']
        }
      }
    },
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['apps/api/src/**/*.{ts,tsx}', 'apps/web/src/**/*.{ts,tsx}'],
      exclude: ['**/node_modules/**', 'apps/web/__tests__/e2e/**', 'apps/api/database/**', 'packages']
    }
  },
  resolve: {
    alias: {
      '@api': path.resolve(__dirname, './apps/api/src'),
      '@web': path.resolve(__dirname, './apps/web/src')
    }
  }
})
