import { BoardForm } from '@/components/kanban/board/BoardForm';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

// Helper function to wrap BoardForm with a submit button for testing
const renderBoardForm = (props: React.ComponentProps<typeof BoardForm>) => {
  return render(
    <BoardForm {...props}>
      <button type="submit">Submit</button>
    </BoardForm>
  );
};

describe('BoardForm', () => {
  it('should render the form with translated labels', () => {
    const handleSubmit = vi.fn();
    renderBoardForm({ onSubmit: handleSubmit });

    expect(screen.getByLabelText('boardTitleLabel')).toHaveValue('');
    expect(screen.getByLabelText('descriptionLabel')).toHaveValue('');
  });

  it('should render the form with default values', () => {
    const handleSubmit = vi.fn();
    const defaultValues = {
      title: 'Default Title',
      description: 'Default Desc'
    };
    renderBoardForm({ onSubmit: handleSubmit, defaultValues });

    expect(screen.getByLabelText('boardTitleLabel')).toHaveValue(
      'Default Title'
    );
    expect(screen.getByLabelText('descriptionLabel')).toHaveValue(
      'Default Desc'
    );
  });

  it('should allow typing into fields', () => {
    const handleSubmit = vi.fn();
    renderBoardForm({ onSubmit: handleSubmit });

    const titleInput = screen.getByLabelText('boardTitleLabel');
    const descriptionInput = screen.getByLabelText('descriptionLabel');

    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Desc' } });

    expect(titleInput).toHaveValue('New Title');
    expect(descriptionInput).toHaveValue('New Desc');
  });

  it('should call onSubmit with form values when submitted successfully', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    renderBoardForm({ onSubmit: handleSubmit });

    const titleInput = screen.getByLabelText('boardTitleLabel');
    const descriptionInput = screen.getByLabelText('descriptionLabel');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Valid Desc' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Valid Title',
          description: 'Valid Desc'
        }),
        expect.anything()
      );
    });
  });

  it('should show validation error if title is empty on submit', async () => {
    const handleSubmit = vi.fn();
    renderBoardForm({ onSubmit: handleSubmit });

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText('Title is required');
    expect(errorMessage).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should render children correctly', () => {
    const handleSubmit = vi.fn();
    render(
      <BoardForm onSubmit={handleSubmit}>
        <div data-testid="child-element">Child Content</div>
      </BoardForm>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
