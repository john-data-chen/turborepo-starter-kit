import UserAuthForm from '@/components/auth/UserAuthForm';
import { defaultEmail } from '@/constants/demoData';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, UseFormReturn } from 'react-hook-form';
// Import UseFormReturn type
import { beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mocking Setup ---
let mockFormInstance: UseFormReturn<{ email: string }>;
let mockIsLoading: boolean;
let mockSubmitFunction: ReturnType<typeof vi.fn>;

vi.mock('@/hooks/useAuthForm', () => ({
  default: () => ({
    form: mockFormInstance,
    loading: mockIsLoading,
    onSubmit: mockSubmitFunction
  })
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));
// --- End of Mocking Setup ---

// Helper component to provide actual react-hook-form context
const TestWrapper = ({ loading = false }: { loading?: boolean }) => {
  // Use the actual useForm hook here
  const form = useForm<{ email: string }>({
    // Set default value directly here if needed, matching useAuthForm hook
    defaultValues: { email: defaultEmail } // Use imported defaultEmail
  });

  // 3. Assign actual values/mocks to placeholders *before* rendering
  mockFormInstance = form;
  mockIsLoading = loading;
  mockSubmitFunction = vi.fn(); // Create a fresh mock function for onSubmit

  return <UserAuthForm />;
};

describe('UserAuthForm Component', () => {
  // Reset only the mock function's call history if needed,
  // as instances are created fresh in TestWrapper now.
  beforeEach(() => {
    // If mockSubmitFunction was defined outside TestWrapper, clear it here:
    // mockSubmitFunction?.mockClear();
    // No need to clear mockUseAuthForm as it's not used directly anymore
  });

  it('should render form elements with translated text keys', () => {
    render(<TestWrapper />);

    // Check for translated label
    expect(screen.getByLabelText('emailLabel')).toBeInTheDocument();

    // Check for input with translated placeholder
    const emailInput = screen.getByPlaceholderText('emailPlaceholder');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveValue(defaultEmail);
    expect(emailInput).toHaveAttribute('data-testid', 'email-input');

    // Check for translated button text
    expect(
      screen.getByRole('button', { name: 'continueButton' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('should allow typing in the email input (overwriting default)', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);
    const emailInput = screen.getByTestId('email-input');

    // Clear the default value first, then type
    await user.clear(emailInput);
    await user.type(emailInput, 'new-test@example.com');
    expect(emailInput).toHaveValue('new-test@example.com');
  });

  it('should call onSubmit when the form is submitted with valid data', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />); // This sets up mockSubmitFunction
    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    // Overwrite default if necessary, or submit directly if default is valid
    await user.clear(emailInput);
    await user.type(emailInput, 'submit-test@example.com');
    await user.click(submitButton);

    // Check if the mockSubmitFunction assigned in TestWrapper was called
    expect(mockSubmitFunction).toHaveBeenCalledTimes(1);
    // Check arguments passed to the actual submit handler by react-hook-form
    // The first argument is the form data.
    expect(mockSubmitFunction).toHaveBeenCalledWith(
      { email: 'submit-test@example.com' }, // Check the submitted data
      expect.anything() // The second argument is the event object
    );
  });

  it('should disable input and button when loading is true', () => {
    render(<TestWrapper loading={true} />);

    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    expect(emailInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should not disable input and button when loading is false', () => {
    render(<TestWrapper loading={false} />);

    const emailInput = screen.getByTestId('email-input');
    const submitButton = screen.getByTestId('submit-button');

    expect(emailInput).not.toBeDisabled();
    expect(submitButton).not.toBeDisabled();
  });
});
