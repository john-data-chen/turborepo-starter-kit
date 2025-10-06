import React from 'react'
import SignInView from '@/components/auth/SignInView'
import { render, screen } from '@testing-library/react'
import { expect, vi } from 'vitest'

// Mock next-intl's useTranslations
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    if (key === 'title') return 'Sign In'
    if (key === 'description') return 'Welcome Back'
    if (key === 'formHint') return 'Enter your email to sign in'
    return key
  })
}))

// Mock the UserAuthForm component
vi.mock('@/components/auth/UserAuthForm', () => ({
  default: vi.fn(() => <div data-testid="user-auth-form">Mock UserAuthForm</div>)
}))

describe('SignInView', () => {
  it('should render the sign-in view with title and form', () => {
    render(<SignInView />)

    // Check if the title is rendered
    expect(screen.getByText('Sign In')).toBeInTheDocument()

    // Check if the UserAuthForm is rendered
    expect(screen.getByTestId('user-auth-form')).toBeInTheDocument()
  })
})
