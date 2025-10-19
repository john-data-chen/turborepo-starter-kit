import { readFileSync } from 'fs'
import { join } from 'path'
import { defaultEmail } from '@/constants/demoData'
import { expect, test } from '@playwright/test'

// Read the JSON file synchronously
const enMessages = JSON.parse(readFileSync(join(process.cwd(), 'messages', 'en.json'), 'utf-8'))

/**
 * Wait for API server to be ready
 * This helps diagnose timing issues in CI environments
 */
async function waitForAPI(url: string, timeout = 30000): Promise<void> {
  const startTime = Date.now()
  let lastError: Error | null = null

  console.log(`[Diagnostic] Waiting for API server at ${url}...`)

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const elapsed = Date.now() - startTime
        console.log(`[Diagnostic] ✓ API server ready after ${elapsed}ms`)
        console.log(`[Diagnostic]   Status: ${response.status}`)
        console.log(`[Diagnostic]   Response: ${await response.text().catch(() => 'N/A')}`)
        return
      }

      lastError = new Error(`API returned ${response.status}`)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }

    // Wait 500ms before retry
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`API server not ready after ${timeout}ms. Last error: ${lastError?.message || 'Unknown'}`)
}

test.describe('SignInPage', () => {
  // Diagnostic: Wait for API to be ready before all tests
  // NOTE: This is a soft check - tests will continue even if API is not ready
  test.beforeAll(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    console.log('[Diagnostic] Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      CI: process.env.CI,
      NEXT_PUBLIC_API_URL: apiUrl,
      NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL
    })

    try {
      // Try to ping the API server
      await waitForAPI(`${apiUrl}/health`, 30000)
    } catch (error) {
      // Soft failure - only warn, don't block tests
      console.warn('[Diagnostic] ⚠️ API health check failed:', error)
      console.warn('[Diagnostic] ⚠️ Tests will continue, but login may fail if API is not ready')
      console.warn('[Diagnostic] ⚠️ This is expected in CI if API takes longer to start than Next.js')
      // Don't throw - let tests run and fail naturally if API is actually down
    }
  })

  test('should load the sign-in page', async ({ page }) => {
    // clear cookies
    await page.context().clearCookies()
    await page.goto('/login')
    const h1 = await page.locator('h1').textContent()
    expect(h1).toBe(enMessages.login.description)
  })

  test('should sign in with valid credentials', async ({ page }) => {
    // Diagnostic: Listen to all network requests
    const requests: Array<{ url: string; method: string; status: number; duration: number }> = []
    const requestStartTimes = new Map<string, number>()

    page.on('request', (request) => {
      const url = request.url()
      requestStartTimes.set(url, Date.now())
      console.log(`[Diagnostic] → Request: ${request.method()} ${url}`)
    })

    page.on('response', (response) => {
      const url = response.url()
      const startTime = requestStartTimes.get(url) || Date.now()
      const duration = Date.now() - startTime
      const status = response.status()

      requests.push({ url, method: response.request().method(), status, duration })
      console.log(`[Diagnostic] ← Response: ${status} ${url} (${duration}ms)`)

      // Log response body for auth-related requests
      if (url.includes('/auth/')) {
        response
          .text()
          .then((body) => {
            console.log(`[Diagnostic]   Body: ${body.substring(0, 200)}`)
          })
          .catch(() => {
            console.log(`[Diagnostic]   Body: (unable to read)`)
          })
      }
    })

    page.on('console', (msg) => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`)
    })

    // Navigate to login page
    console.log('[Diagnostic] Navigating to /login')
    await page.goto('/login')

    // Fill in email
    console.log(`[Diagnostic] Filling email: ${defaultEmail}`)
    await page.fill('input[name="email"]', defaultEmail)

    // Click submit button
    console.log('[Diagnostic] Clicking submit button')
    const submitStart = Date.now()
    await page.click('button[type="submit"]')

    // Wait for navigation with increased timeout
    console.log('[Diagnostic] Waiting for navigation to /boards...')
    try {
      await expect(page).toHaveURL(/^http:\/\/localhost:3000\/en\/boards(\?.*)?$/, {
        timeout: 30000 // Increased from default 5000ms to 30000ms
      })
      const submitDuration = Date.now() - submitStart
      console.log(`[Diagnostic] ✓ Navigation successful after ${submitDuration}ms`)
    } catch (error) {
      const currentUrl = page.url()
      console.error('[Diagnostic] ✗ Navigation failed')
      console.error(`[Diagnostic]   Current URL: ${currentUrl}`)
      console.error(`[Diagnostic]   Expected URL pattern: /^http:\\/\\/localhost:3000\\/en\\/boards(\\?.*)?$/`)
      console.error('[Diagnostic]   Network requests:')
      requests.forEach((req) => {
        console.error(`[Diagnostic]     ${req.method} ${req.url} - ${req.status} (${req.duration}ms)`)
      })

      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/login-failure.png', fullPage: true })
      console.error('[Diagnostic]   Screenshot saved to test-results/login-failure.png')

      throw error
    }
  })
})
