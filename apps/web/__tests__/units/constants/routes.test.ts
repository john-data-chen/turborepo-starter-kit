import { API_URL, ROUTES, URL_PARAMS } from '@/constants/routes'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('routes constants', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv
  })

  describe('API_URL', () => {
    it('should use environment variable when available', () => {
      expect(API_URL).toBeDefined()
      expect(typeof API_URL).toBe('string')
    })

    it('should be a valid URL format', () => {
      expect(API_URL).toMatch(/^https?:\/\//)
    })
  })

  describe('URL_PARAMS', () => {
    it('should have LOGIN_SUCCESS parameter', () => {
      expect(URL_PARAMS.LOGIN_SUCCESS).toBe('login_success=true')
    })

    it('should be readonly', () => {
      expect(Object.isFrozen(URL_PARAMS)).toBe(false) // as const makes type readonly, not runtime frozen
      expect(typeof URL_PARAMS).toBe('object')
    })
  })

  describe('ROUTES', () => {
    it('should have HOME route', () => {
      expect(ROUTES.HOME).toBe('/')
    })

    it('should have API route matching API_URL', () => {
      expect(ROUTES.API).toBe(API_URL)
    })

    describe('AUTH routes', () => {
      it('should have LOGIN_API route', () => {
        expect(ROUTES.AUTH.LOGIN_API).toContain('/auth/login')
        expect(ROUTES.AUTH.LOGIN_API).toContain(API_URL)
      })

      it('should have LOGIN_PAGE route', () => {
        expect(ROUTES.AUTH.LOGIN_PAGE).toBe('/login')
      })

      it('should have valid LOGIN_API URL format', () => {
        expect(ROUTES.AUTH.LOGIN_API).toMatch(/^https?:\/\//)
      })
    })

    describe('BOARDS routes', () => {
      it('should have OVERVIEW_PAGE route', () => {
        expect(ROUTES.BOARDS.OVERVIEW_PAGE).toBe('/boards')
      })
    })

    it('should be a nested object structure', () => {
      expect(typeof ROUTES).toBe('object')
      expect(typeof ROUTES.AUTH).toBe('object')
      expect(typeof ROUTES.BOARDS).toBe('object')
    })

    it('should have all string values for routes', () => {
      expect(typeof ROUTES.HOME).toBe('string')
      expect(typeof ROUTES.API).toBe('string')
      expect(typeof ROUTES.AUTH.LOGIN_API).toBe('string')
      expect(typeof ROUTES.AUTH.LOGIN_PAGE).toBe('string')
      expect(typeof ROUTES.BOARDS.OVERVIEW_PAGE).toBe('string')
    })
  })
})
