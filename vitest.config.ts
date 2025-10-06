import path from 'path'
import react from '@vitejs/plugin-react-swc'
import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), swc.vite()],
  test: {
    globals: true,
    include: ['apps/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'apps/web/__tests__/e2e/**'],
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@src': path.resolve(__dirname, './apps/api/src'),
      '@tests': path.resolve(__dirname, './apps/api/__tests__'),
      '@': path.resolve(__dirname, './apps/web/src')
    },
    deps: {
      optimizer: {
        web: {
          include: ['next-intl']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './apps/api/src'),
      '@tests': path.resolve(__dirname, './apps/api/__tests__'),
      '@': path.resolve(__dirname, './apps/web/src')
    }
  }
})
