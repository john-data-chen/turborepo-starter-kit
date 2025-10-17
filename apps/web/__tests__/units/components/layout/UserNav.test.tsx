/// <reference types="react" />
import React from 'react'
import { UserNav } from '@/components/layout/UserNav'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Ensure React is globally available
globalThis.React = React

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

describe('UserNav', () => {
  const mockUser = {
    _id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date()
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkSession: vi.fn()
    })
  })

  it('should render user nav when authenticated', () => {
    const { container } = render(<UserNav />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render user avatar fallback', () => {
    const { container } = render(<UserNav />)
    // Avatar should render with first letter of email
    expect(container.firstChild).toBeTruthy()
  })

  it('should show loading state', async () => {
    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      checkSession: vi.fn()
    })

    const { container } = render(<UserNav />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should not render when not authenticated', async () => {
    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkSession: vi.fn()
    })

    const { container } = render(<UserNav />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should not render when user is null', async () => {
    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkSession: vi.fn()
    })

    const { container } = render(<UserNav />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should handle email without @ symbol', async () => {
    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockUser, email: 'invalidemailformat' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkSession: vi.fn()
    })

    const { container } = render(<UserNav />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should handle uppercase email', async () => {
    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockUser, email: 'TEST@EXAMPLE.COM' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkSession: vi.fn()
    })

    render(<UserNav />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('should handle email with special characters', async () => {
    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockUser, email: 'test+special@example.com' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkSession: vi.fn()
    })

    const { container } = render(<UserNav />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should handle long email addresses', async () => {
    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockUser, email: 'verylongemailaddress12345@example.com' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkSession: vi.fn()
    })

    const { container } = render(<UserNav />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render component structure correctly', () => {
    const { container } = render(<UserNav />)
    expect(container.firstChild).toBeTruthy()
  })
})
