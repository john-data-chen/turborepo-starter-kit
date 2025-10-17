import { routing } from '@/i18n/routing'
import { describe, expect, it } from 'vitest'

describe('i18n routing', () => {
  it('should have correct locales configuration', () => {
    expect(routing.locales).toBeDefined()
    expect(routing.locales).toContain('en')
    expect(routing.locales).toContain('de')
  })

  it('should have correct default locale', () => {
    expect(routing.defaultLocale).toBe('en')
  })

  it('should have all required routing properties', () => {
    expect(routing).toHaveProperty('locales')
    expect(routing).toHaveProperty('defaultLocale')
  })
})
