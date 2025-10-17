import '@testing-library/jest-dom/vitest'
import dotenv from 'dotenv'
import 'dotenv/config'
// Import vi for mocking if needed

// Determine the correct path to the .env.test file relative to the project root
import { execSync } from 'child_process'
import path from 'path'
import { beforeAll, vi } from 'vitest'

const root = execSync('git rev-parse --show-toplevel').toString().trim()
const envPath = path.resolve(root, '.env.test')

// Load environment variables from .env.test specifically for tests
const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('Error loading .env.test file:', result.error) // Debugging line
} else {
  console.log('.env.test file loaded successfully.') // Debugging line
  console.log('DATABASE_URL loaded:', process.env.DATABASE_URL) // Optional: Check if variable is loaded
}

// --- Add other global test setups below ---

// Example: Mocking matchMedia for testing hooks like useIsMobile or other browser APIs
if (typeof window !== 'undefined') {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    })
    // Mock other browser APIs if necessary for your tests
    // e.g., localStorage, sessionStorage, etc.
  })
}

// You can add other global mocks or configurations here

// Mock @repo/ui components (note: @repo/ui/components/* exports from /src/components/ui/*)
vi.mock('@repo/ui/components/button', () => ({
  Button: ({ children, className, onClick, ...props }: any) => {
    const React = require('react')
    return React.createElement('button', { className, onClick, ...props }, children)
  }
}))

vi.mock('@repo/ui/components/card', () => {
  const React = require('react')
  return {
    Card: ({ children, className, onClick }: any) => React.createElement('div', { className, onClick }, children),
    CardHeader: ({ children }: any) => React.createElement('div', null, children),
    CardTitle: ({ children }: any) => React.createElement('h3', null, children),
    CardContent: ({ children }: any) => React.createElement('div', null, children)
  }
})

vi.mock('@repo/ui/components/input', () => ({
  Input: (props: any) => {
    const React = require('react')
    return React.createElement('input', props)
  }
}))

vi.mock('@repo/ui/components/select', () => {
  const React = require('react')
  return {
    Select: ({ children, value, onValueChange }: any) =>
      React.createElement('div', { 'data-value': value, onClick: () => onValueChange?.('test') }, children),
    SelectTrigger: ({ children, ...props }: any) => React.createElement('div', props, children),
    SelectValue: ({ placeholder }: any) => React.createElement('span', null, placeholder),
    SelectContent: ({ children }: any) => React.createElement('div', null, children),
    SelectItem: ({ children, value, ...props }: any) =>
      React.createElement('div', { ...props, 'data-value': value }, children)
  }
})

vi.mock('@repo/ui/components/skeleton', () => ({
  Skeleton: ({ className }: any) => {
    const React = require('react')
    return React.createElement('div', { className, 'data-testid': 'skeleton' })
  }
}))

vi.mock('next/navigation', () => {
  const actual = vi.importActual('next/navigation')
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn()
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    redirect: vi.fn((path) => {
      console.log(`Mock redirect to: ${path}`)
    }),
    permanentRedirect: vi.fn((path) => {
      console.log(`Mock permanent redirect to: ${path}`)
    })
  }
})
