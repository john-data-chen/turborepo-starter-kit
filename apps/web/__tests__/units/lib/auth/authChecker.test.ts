import { isAuthenticated } from '@/lib/auth/authChecker'
import { cookies } from 'next/headers'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn()
}))

describe('authChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isAuthenticated', () => {
    it('should return true when jwt cookie exists', async () => {
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([
          { name: 'jwt', value: 'mock-jwt-token' },
          { name: 'other', value: 'other-value' }
        ])
      }
      ;(cookies as Mock).mockResolvedValue(mockCookieStore)

      const result = await isAuthenticated()

      expect(result).toEqual({ isAuthenticated: true })
      expect(mockCookieStore.getAll).toHaveBeenCalled()
    })

    it('should return false when jwt cookie does not exist', async () => {
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([{ name: 'other', value: 'other-value' }])
      }
      ;(cookies as Mock).mockResolvedValue(mockCookieStore)

      const result = await isAuthenticated()

      expect(result).toEqual({ isAuthenticated: false })
      expect(mockCookieStore.getAll).toHaveBeenCalled()
    })

    it('should return false when jwt cookie has empty value', async () => {
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([{ name: 'jwt', value: '' }])
      }
      ;(cookies as Mock).mockResolvedValue(mockCookieStore)

      const result = await isAuthenticated()

      expect(result).toEqual({ isAuthenticated: false })
    })

    it('should return false when no cookies exist', async () => {
      const mockCookieStore = {
        getAll: vi.fn().mockReturnValue([])
      }
      ;(cookies as Mock).mockResolvedValue(mockCookieStore)

      const result = await isAuthenticated()

      expect(result).toEqual({ isAuthenticated: false })
    })

    it('should return false and log error on exception', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockError = new Error('Cookie store error')
      ;(cookies as Mock).mockRejectedValue(mockError)

      const result = await isAuthenticated()

      expect(result).toEqual({ isAuthenticated: false })
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error checking authentication:', mockError)

      consoleErrorSpy.mockRestore()
    })
  })
})
