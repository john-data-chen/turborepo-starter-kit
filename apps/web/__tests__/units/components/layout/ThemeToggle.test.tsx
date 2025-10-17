/// <reference types="react" />
import React from 'react'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

globalThis.React = React

vi.mock('next-themes', () => ({
  useTheme: vi.fn()
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

vi.mock('@radix-ui/react-icons', () => ({
  SunIcon: () => <div data-testid="sun-icon">Sun</div>,
  MoonIcon: () => <div data-testid="moon-icon">Moon</div>
}))

vi.mock('@repo/ui/components/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

vi.mock('@repo/ui/components/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="dropdown-item" onClick={onClick}>
      {children}
    </div>
  )
}))

describe('ThemeToggle', () => {
  const mockSetTheme = vi.fn()

  beforeEach(async () => {
    vi.clearAllMocks()
    const { useTheme } = await import('next-themes')
    vi.mocked(useTheme).mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'light',
      themes: ['light', 'dark', 'system']
    } as any)
  })

  it('should render theme toggle', () => {
    render(<ThemeToggle />)
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
  })

  it('should render sun icon', () => {
    render(<ThemeToggle />)
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
  })

  it('should render moon icon', () => {
    render(<ThemeToggle />)
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
  })

  it('should render dropdown trigger', () => {
    render(<ThemeToggle />)
    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument()
  })

  it('should render dropdown content', () => {
    render(<ThemeToggle />)
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()
  })

  it('should render theme options', () => {
    render(<ThemeToggle />)
    expect(screen.getByText('light')).toBeInTheDocument()
    expect(screen.getByText('dark')).toBeInTheDocument()
    expect(screen.getByText('system')).toBeInTheDocument()
  })

  it('should render screen reader text', () => {
    render(<ThemeToggle />)
    expect(screen.getByText('toggleTheme')).toBeInTheDocument()
  })

  it('should render all theme toggle elements', () => {
    render(<ThemeToggle />)
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    expect(screen.getByText('light')).toBeInTheDocument()
    expect(screen.getByText('dark')).toBeInTheDocument()
    expect(screen.getByText('system')).toBeInTheDocument()
  })

  it('should call setTheme with light when light option is clicked', () => {
    const { container } = render(<ThemeToggle />)
    const items = container.querySelectorAll('[data-testid="dropdown-item"]')
    const lightItem = Array.from(items).find((item) => item.textContent === 'light')

    if (lightItem) {
      ;(lightItem as HTMLElement).click()
    }

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('should call setTheme with dark when dark option is clicked', () => {
    const { container } = render(<ThemeToggle />)
    const items = container.querySelectorAll('[data-testid="dropdown-item"]')
    const darkItem = Array.from(items).find((item) => item.textContent === 'dark')

    if (darkItem) {
      ;(darkItem as HTMLElement).click()
    }

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should call setTheme with system when system option is clicked', () => {
    const { container } = render(<ThemeToggle />)
    const items = container.querySelectorAll('[data-testid="dropdown-item"]')
    const systemItem = Array.from(items).find((item) => item.textContent === 'system')

    if (systemItem) {
      ;(systemItem as HTMLElement).click()
    }

    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })
})
