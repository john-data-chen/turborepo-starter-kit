import { defineConfig } from 'vitest/config'
import rootConfig from '../../vitest.config'

export default defineConfig({
  ...rootConfig,
  test: {
    ...rootConfig.test,
    include: ['__tests__/**/*.test.{ts,tsx}'],
    setupFiles: ['../../vitest.setup.ts'],
    environment: 'node'
  }
})
