import { ROUTES } from '@/constants/routes'
import { Session, UserInfo } from '@/types/dbInterface'
import Cookies from 'js-cookie'

const API_BASE = ROUTES.API

export class AuthService {
  static async login(email: string): Promise<{ access_token: string; user?: UserInfo }> {
    const requestId = Math.random().toString(36).substring(2, 8)
    console.log(`[${requestId}] [AuthService] Attempting login for email:`, email)
    console.log(`[${requestId}] [AuthService] Login API URL:`, ROUTES.AUTH.LOGIN_API)
    console.log(`[${requestId}] [AuthService] Current domain:`, window.location.hostname)
    console.log(`[${requestId}] [AuthService] Current protocol:`, window.location.protocol)
    console.log(`[${requestId}] [AuthService] Existing cookies:`, document.cookie)

    try {
      const response = await fetch(ROUTES.AUTH.LOGIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        credentials: 'include', // This is crucial for receiving cookies
        body: JSON.stringify({ email })
      })

      console.log(`[${requestId}] [AuthService] Login response status:`, response.status)
      console.log(
        `[${requestId}] [AuthService] Login response headers:`,
        Object.fromEntries(response.headers.entries())
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Login failed')
        console.error(`[${requestId}] [AuthService] Login error:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(errorText || 'Login failed')
      }

      // Get the response data
      const data = await response.json()
      console.log(`[${requestId}] [AuthService] Login successful, response data:`, data)

      // Check if cookies were set
      console.log(`[${requestId}] [AuthService] Cookies after login:`, document.cookie)

      // Check for specific cookies
      const jwtCookie = document.cookie.split(';').find((c) => c.trim().startsWith('jwt='))
      const authCookie = document.cookie.split(';').find((c) => c.trim().startsWith('isAuthenticated='))
      console.log(
        `[${requestId}] [AuthService] JWT cookie in document.cookie:`,
        !!jwtCookie,
        '(should be false for httpOnly cookies)'
      )
      console.log(`[${requestId}] [AuthService] Auth cookie found:`, !!authCookie)

      // Store the token for Authorization header
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token)
        console.log(`[${requestId}] [AuthService] Token stored in localStorage`)
      }

      return {
        access_token: data.access_token || 'http-only-cookie',
        user: data.user // Include user data from backend response
      }
    } catch (error) {
      console.error(`[${requestId}] [AuthService] Login request failed:`, error)
      throw error
    }
  }

  static async getProfile(): Promise<UserInfo> {
    const requestId = Math.random().toString(36).substring(2, 8)
    console.log(`[${requestId}] [AuthService] Fetching profile from:`, `${API_BASE}/auth/profile`)
    console.log(`[${requestId}] [AuthService] Current domain:`, window.location.hostname)
    console.log(`[${requestId}] [AuthService] Current cookies before request:`, document.cookie)

    // Check for specific cookies
    // Note: JWT cookie is httpOnly, so it won't appear in document.cookie - this is expected!
    const jwtCookie = document.cookie.split(';').find((c) => c.trim().startsWith('jwt='))
    const authCookie = document.cookie.split(';').find((c) => c.trim().startsWith('isAuthenticated='))
    console.log(
      `[${requestId}] [AuthService] JWT cookie in document.cookie:`,
      !!jwtCookie,
      '(should be false for httpOnly cookies)'
    )
    console.log(`[${requestId}] [AuthService] Auth cookie present:`, !!authCookie)
    if (jwtCookie) {
      console.log(`[${requestId}] [AuthService] JWT cookie length:`, jwtCookie.length)
    }

    // Try to get token from localStorage for Authorization header
    const token = localStorage.getItem('auth_token')
    console.log(`[${requestId}] [AuthService] Token from localStorage:`, !!token)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }

    // Add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`
      console.log(`[${requestId}] [AuthService] Added Authorization header`)
    }

    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'GET',
      credentials: 'include', // Still try cookies as fallback
      headers,
      // Add cache control to prevent caching issues
      cache: 'no-store',
      mode: 'cors'
    })

    console.log(`[${requestId}] [AuthService] Profile response status:`, response.status)
    console.log(
      `[${requestId}] [AuthService] Profile response headers:`,
      Object.fromEntries(response.headers.entries())
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Failed to fetch profile')
      console.error(`[${requestId}] [AuthService] Profile fetch error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })

      if (response.status === 401) {
        console.log(`[${requestId}] [AuthService] Authentication failed, clearing session`)
        this.logout()
      }

      throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`)
    }

    const user = await response.json()
    console.log(`[${requestId}] [AuthService] Profile response data:`, user)

    // Ensure we have required fields
    if (!user || !user.email) {
      throw new Error('Invalid user data received from server')
    }

    // Map the backend user to our frontend User type
    return {
      _id: user._id,
      email: user.email,
      name: user.name || user.email.split('@')[0] || 'User'
    }
  }

  static async getSession(): Promise<Session | null> {
    try {
      console.log('Getting session...')

      // First try to get the profile using the HTTP-only cookie
      const user = await this.getProfile()

      if (!user) {
        console.log('No user found in session')
        return null
      }

      console.log('Session user found:', {
        id: user._id,
        email: user.email,
        name: user.name
      })

      return {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name || user.email.split('@')[0]
        },
        accessToken: 'http-only-cookie' // The actual token is in the HTTP-only cookie
      }
    } catch (error) {
      console.error('Session validation error:', error)
      // Don't throw here, just return null to indicate no valid session
      return null
    }
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove('jwt', { path: '/' })
      localStorage.removeItem('auth_token')
      console.log('[AuthService] Cleared cookies and localStorage token')
    }
  }
}
