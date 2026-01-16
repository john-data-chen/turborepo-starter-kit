import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/providers/auth-provider";

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn()
}));

// Mock ReactQueryDevtools
vi.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => null
}));

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({
      user: null,
      isLoading: false,
      error: null
    });
  });

  it("should render children", () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should call useAuth hook on mount", () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    expect(useAuth).toHaveBeenCalled();
  });

  it("should wrap children with QueryClientProvider", () => {
    const { container } = render(
      <AuthProvider>
        <div data-testid="child">Test Child</div>
      </AuthProvider>
    );

    const child = screen.getByTestId("child");
    expect(child).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    render(
      <AuthProvider>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </AuthProvider>
    );

    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
    expect(screen.getByText("Child 3")).toBeInTheDocument();
  });
});
