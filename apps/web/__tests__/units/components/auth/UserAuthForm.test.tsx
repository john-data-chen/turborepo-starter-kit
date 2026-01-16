import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { expect, vi } from "vitest";

import UserAuthForm from "@/components/auth/UserAuthForm";
import { useAuthForm } from "@/hooks/useAuth";

// Mock next-intl's useTranslations
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => {
    if (key === "emailLabel") {
      return "Email";
    }
    if (key === "emailPlaceholder") {
      return "m@example.com";
    }
    if (key === "continueButton") {
      return "Continue";
    }
    if (key === "invalidEmail") {
      return "Invalid email address";
    }
    return key;
  })
}));

// Mock the useAuthForm hook
const mockHandleSubmit = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuthForm: vi.fn(() => ({
    handleSubmit: mockHandleSubmit,
    isLoading: false,
    error: null,
    isNavigating: false
  }))
}));

// Mock @hookform/resolvers/zod and react-hook-form
vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn(() => (schema: any) => (values: any) => {
    try {
      schema.parse(values);
      return { values, errors: {} };
      // oxlint-disable-next-line no-unused-vars
    } catch (error: any) {
      return { values: {}, errors: { email: { message: "Invalid email address" } } };
    }
  })
}));

vi.mock("react-hook-form", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useForm: vi.fn(() => ({
      control: {},
      handleSubmit: vi.fn((cb) => (e) => {
        e.preventDefault();
        cb({ email: "test@example.com" });
      }),
      formState: { errors: {} },
      register: vi.fn(),
      setValue: vi.fn(),
      getValues: vi.fn(() => ({ email: "test@example.com" }))
    }))
  };
});

// Mock @repo/ui components
vi.mock("@repo/ui", () => ({
  Button: vi.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  Form: vi.fn(({ children }) => <>{children}</>),
  FormControl: vi.fn(({ children }) => <>{children}</>),
  FormField: vi.fn(({ render }) =>
    render({ field: { name: "email", value: "test@example.com", onChange: vi.fn(), id: "email" } })
  ),
  FormItem: vi.fn(({ children }) => <div>{children}</div>),
  FormLabel: vi.fn(({ children }) => <label htmlFor="email">{children}</label>),
  FormMessage: vi.fn(() => <div data-testid="form-message" />),
  Input: vi.fn((props) => <input {...props} />)
}));

describe("UserAuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form with email input and submit button", () => {
    render(<UserAuthForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  it("should call handleSubmit on form submission with valid email", async () => {
    render(<UserAuthForm />);

    const submitButton = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("should display an error message if login fails", () => {
    // Mock useAuthForm to return an error
    vi.mocked(useAuthForm).mockReturnValueOnce({
      handleSubmit: mockHandleSubmit,
      isLoading: false,
      error: "Login failed",
      isNavigating: false
    });

    render(<UserAuthForm />);

    expect(screen.getByTestId("error-message")).toHaveTextContent("Login failed");
  });

  it("should disable inputs and button when loading or navigating", () => {
    vi.mocked(useAuthForm).mockReturnValueOnce({
      handleSubmit: mockHandleSubmit,
      isLoading: true,
      error: null,
      isNavigating: true
    });

    render(<UserAuthForm />);

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByTestId("submit-button")).toBeDisabled();
  });
});
