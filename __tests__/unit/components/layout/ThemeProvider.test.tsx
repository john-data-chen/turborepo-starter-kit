import ThemeProvider from '@/components/layout/ThemeProvider';
import { render, screen } from '@testing-library/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
// Import the original for mocking
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock the underlying NextThemesProvider
vi.mock('next-themes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-themes')>();
  return {
    ...actual,
    ThemeProvider: vi.fn(({ children, ...props }) => (
      <div
        data-testid="mock-next-themes-provider"
        data-props={JSON.stringify(props)}
      >
        {children}
      </div>
    ))
  };
});

// Cast the mock to the expected type for type safety in tests
// Remove the 'as vi.Mock' assertion
const MockedNextThemesProvider = NextThemesProvider;

describe('ThemeProvider Component', () => {
  const childText = 'Test Child Content';
  const ChildComponent = () => <div>{childText}</div>;

  it('should render children and pass props to NextThemesProvider', () => {
    // Correct the type of 'attribute' to be the specific literal 'class'
    const testProps = {
      attribute: 'class' as const, // Use 'as const' or explicitly type if needed
      defaultTheme: 'system',
      enableSystem: true
    };

    render(
      <ThemeProvider {...testProps}>
        <ChildComponent />
      </ThemeProvider>
    );

    // Check if children are rendered
    expect(screen.getByText(childText)).toBeInTheDocument();

    // Check if the mock provider was rendered
    const mockProvider = screen.getByTestId('mock-next-themes-provider');
    expect(mockProvider).toBeInTheDocument();

    // Check if the props were passed correctly to the mocked NextThemesProvider
    // This assertion works correctly even without the 'as vi.Mock' assertion
    // because MockedNextThemesProvider points to the mock function created by vi.mock
    expect(MockedNextThemesProvider).toHaveBeenCalledTimes(1);
    const passedProps = JSON.parse(
      mockProvider.getAttribute('data-props') || '{}'
    );
    // Ensure the comparison object also uses the correct literal type if necessary
    expect(passedProps).toEqual({
      attribute: 'class',
      defaultTheme: 'system',
      enableSystem: true
    });

    // Alternatively, check the mock's call arguments directly
    expect(MockedNextThemesProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: 'class', // Ensure this matches the expected literal type
        defaultTheme: 'system',
        enableSystem: true
      }),
      undefined // The second argument (context) is undefined in this rendering scenario
    );
  });
});
