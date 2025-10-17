import React from 'react'
import Providers from '@/components/layout/Providers'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock ThemeProvider
vi.mock('@/components/layout/ThemeProvider', () => ({
  default: ({ children, attribute, defaultTheme, enableSystem }: any) => (
    <div
      data-testid="theme-provider"
      data-attribute={attribute}
      data-default-theme={defaultTheme}
      data-enable-system={enableSystem}
    >
      {children}
    </div>
  )
}))

describe('Providers', () => {
  it('should render children', () => {
    render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should wrap children with ThemeProvider', () => {
    render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    )

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
  })

  it('should pass correct props to ThemeProvider', () => {
    render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    )

    const themeProvider = screen.getByTestId('theme-provider')
    expect(themeProvider).toHaveAttribute('data-attribute', 'class')
    expect(themeProvider).toHaveAttribute('data-default-theme', 'system')
    expect(themeProvider).toHaveAttribute('data-enable-system', 'true')
  })

  it('should render multiple children', () => {
    render(
      <Providers>
        <div>First Child</div>
        <div>Second Child</div>
      </Providers>
    )

    expect(screen.getByText('First Child')).toBeInTheDocument()
    expect(screen.getByText('Second Child')).toBeInTheDocument()
  })

  it('should render with nested components', () => {
    render(
      <Providers>
        <div>
          <span>Nested Content</span>
        </div>
      </Providers>
    )

    expect(screen.getByText('Nested Content')).toBeInTheDocument()
  })
})
