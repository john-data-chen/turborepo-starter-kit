import React from 'react'
import { ClientProviders } from '@/providers/client-providers'
import { useAuthStore } from '@/stores/auth-store'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

// Mock auth store
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn()
}))

// Mock ReactQueryDevtools
vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

describe('ClientProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuthStore as unknown as Mock).mockReturnValue({
      user: null,
      isLoading: false,
      error: null
    })
  })

  it('should render children', () => {
    render(
      <ClientProviders>
        <div>Test Child</div>
      </ClientProviders>
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should call useAuthStore hook on mount', () => {
    render(
      <ClientProviders>
        <div>Test Child</div>
      </ClientProviders>
    )

    expect(useAuthStore).toHaveBeenCalled()
  })

  it('should wrap children with QueryClientProvider and ThemeProvider', () => {
    const { container } = render(
      <ClientProviders>
        <div data-testid="child">Test Child</div>
      </ClientProviders>
    )

    const child = screen.getByTestId('child')
    expect(child).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    render(
      <ClientProviders>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ClientProviders>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
    expect(screen.getByText('Child 3')).toBeInTheDocument()
  })
})
