/// <reference types="react" />
import React from 'react'
import { BoardForm } from '@/components/kanban/board/BoardForm'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

globalThis.React = React

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

vi.mock('@repo/ui/components/form', () => ({
  Form: ({ children }: any) => <div data-testid="form">{children}</div>,
  FormField: ({ render }: any) => {
    const field = { value: '', onChange: vi.fn(), onBlur: vi.fn(), name: 'test' }
    return render({ field })
  },
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormMessage: () => <span data-testid="form-message" />
}))

describe('BoardForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render board form', () => {
    render(<BoardForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('form')).toBeInTheDocument()
  })

  it('should render title input', () => {
    render(<BoardForm onSubmit={mockOnSubmit} />)
    expect(screen.getByText('boardTitleLabel')).toBeInTheDocument()
  })

  it('should render description textarea', () => {
    render(<BoardForm onSubmit={mockOnSubmit} />)
    expect(screen.getByText('descriptionLabel')).toBeInTheDocument()
  })

  it('should render with default values', () => {
    render(
      <BoardForm
        defaultValues={{ title: 'Test Board', description: 'Test Description' }}
        onSubmit={mockOnSubmit}
      />
    )
    expect(screen.getByTestId('form')).toBeInTheDocument()
  })

  it('should render with children', () => {
    render(
      <BoardForm onSubmit={mockOnSubmit}>
        <button data-testid="custom-button">Submit</button>
      </BoardForm>
    )
    expect(screen.getByTestId('custom-button')).toBeInTheDocument()
  })

  it('should render without children', () => {
    render(<BoardForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('form')).toBeInTheDocument()
  })

  it('should handle form submission', () => {
    const { container } = render(<BoardForm onSubmit={mockOnSubmit} />)
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
  })
})
