import { defaultEmail } from '@/constants/demoData'
import { describe, expect, it } from 'vitest'

describe('demoData constants', () => {
  it('should have correct defaultEmail value', () => {
    expect(defaultEmail).toBe('mark.s@example.com')
  })

  it('should have valid email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(defaultEmail).toMatch(emailRegex)
  })

  it('should be a string type', () => {
    expect(typeof defaultEmail).toBe('string')
  })

  it('should not be empty', () => {
    expect(defaultEmail.length).toBeGreaterThan(0)
  })
})
