import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    alias: {
      '@src': './src',
      '@tests': './__tests__'
    },
    root: './'
  },
  resolve: {
    alias: {
      '@src': './src',
      '@tests': './__tests__'
    }
  },
  plugins: [swc.vite()]
})
