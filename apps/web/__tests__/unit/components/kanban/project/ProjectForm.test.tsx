import { ProjectForm } from '@/components/kanban/project/ProjectForm';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock UI components
vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <form data-testid="form">{children}</form>,
  FormControl: ({ children }: any) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormField: ({ render, ...props }: any) =>
    render({ field: { value: '', onChange: () => {} } }),
  FormItem: ({ children }: any) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: any) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormMessage: () => <div data-testid="form-message" />
}));
vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />
}));
vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea data-testid="textarea" {...props} />
}));
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn()
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

describe('ProjectForm', () => {
  it('should render title and description fields', () => {
    render(<ProjectForm onSubmit={vi.fn()} />);
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getAllByTestId('form-label')[0]).toHaveTextContent(
      'titleLabel'
    );
    expect(screen.getAllByTestId('form-label')[1]).toHaveTextContent(
      'descriptionLabel'
    );
  });

  it('should render children', () => {
    render(
      <ProjectForm onSubmit={vi.fn()}>
        <button data-testid="child-btn">Child</button>
      </ProjectForm>
    );
    expect(screen.getByTestId('child-btn')).toBeInTheDocument();
  });
});
