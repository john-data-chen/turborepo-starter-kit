import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('env config', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env }

    // Set DATABASE_URL for tests to avoid error
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
    process.env.NODE_ENV = 'test'

    // Clear module cache to get fresh import
    vi.resetModules()
  })

  afterEach(() => {
    // Restore original env
    process.env = originalEnv
  })

  it('should export config object', async () => {
    const { config } = await import('@/lib/config/env')

    expect(config).toBeDefined()
    expect(typeof config).toBe('object')
  })

  it('should have required config properties', async () => {
    const { config } = await import('@/lib/config/env')

    expect(config).toHaveProperty('databaseUrl')
    expect(config).toHaveProperty('nodeEnv')
    expect(config).toHaveProperty('isProduction')
    expect(config).toHaveProperty('isDevelopment')
    expect(config).toHaveProperty('isTest')
    expect(config).toHaveProperty('appName')
    expect(config).toHaveProperty('baseUrl')
    expect(config).toHaveProperty('enableAnalytics')
    expect(config).toHaveProperty('debug')
  })

  it('should have correct environment flags', async () => {
    const { config } = await import('@/lib/config/env')

    // In test environment
    expect(typeof config.isProduction).toBe('boolean')
    expect(typeof config.isDevelopment).toBe('boolean')
    expect(typeof config.isTest).toBe('boolean')
  })

  it('should have default values for optional configs', async () => {
    const { config } = await import('@/lib/config/env')

    expect(config.appName).toBeDefined()
    expect(typeof config.appName).toBe('string')

    expect(config.baseUrl).toBeDefined()
    expect(typeof config.baseUrl).toBe('string')

    expect(typeof config.enableAnalytics).toBe('boolean')
    expect(typeof config.debug).toBe('boolean')
  })

  it('should correctly parse boolean feature flags', async () => {
    const { config } = await import('@/lib/config/env')

    // enableAnalytics should be false unless explicitly set to 'true'
    expect(config.enableAnalytics).toBe(false)

    // debug should be false unless explicitly set to 'true'
    expect(config.debug).toBe(false)
  })

  it('should have correct nodeEnv value', async () => {
    const { config } = await import('@/lib/config/env')

    expect(config.nodeEnv).toBeDefined()
    expect(['development', 'production', 'test']).toContain(config.nodeEnv)
  })
})
