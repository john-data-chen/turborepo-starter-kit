import path from 'path'
import { defineConfig, devices } from '@playwright/test'
// Add this line to import dotenv
import dotenv from 'dotenv'

// Load environment variables from .env file first (as fallback)
// dotenv will not override existing environment variables (e.g., from CI)
dotenv.config({ path: path.resolve(__dirname, '.env') })

// Load environment variables from .env.test file
// Variables in .env.test will override those in .env if they exist
// Existing environment variables (e.g., from CI) will still take precedence
dotenv.config({ path: path.resolve(__dirname, '.env.test'), override: true }) // Use override: true here to ensure .env.test takes precedence over .env

// Ensure environment variables are set or use default values
// process.env will now contain variables loaded according to the priority:
// 1. System Env (CI)
// 2. .env.test
// 3. .env
const baseURL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './__tests__/e2e/',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000/en/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // headless mode
    headless: true
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge'
      }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] }
    }

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // Note: Playwright tests require both web and API servers to be running.
  // The web server and API server will start automatically.
  // You must ensure MongoDB is running:
  // - Locally: docker compose up -d (in apps/api/database/)
  // - Or use a cloud MongoDB instance (set DATABASE_URL in .env.test)
  webServer: [
    {
      command: 'pnpm --filter=turborepo-starter-kit-api dev',
      url: 'http://localhost:3001/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      // Pass the resolved environment variables to the API server process
      env: {
        ...process.env, // Pass all resolved environment variables
        NODE_ENV: process.env.NODE_ENV || 'test',
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET
      },
      stdout: 'pipe',
      stderr: 'pipe'
    },
    {
      command: 'pnpm --filter=turborepo-starter-kit-web dev',
      url: baseURL, // Use the resolved baseURL
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      // Pass the resolved environment variables to the web server process
      env: {
        ...process.env, // Pass all resolved environment variables
        NODE_ENV: process.env.NODE_ENV || 'test',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || baseURL
      },
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ]
})
