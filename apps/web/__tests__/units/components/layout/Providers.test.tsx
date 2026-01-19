import { render, screen } from "@testing-library/react";
/// <reference types="react" />
import React from "react";
import { describe, expect, it, vi } from "vitest";

import Providers from "@/components/layout/Providers";

globalThis.React = React;

// Mock ThemeProvider
vi.mock("@/components/layout/ThemeProvider", () => ({
  default: ({ children }: any) => <div data-testid="theme-provider">{children}</div>
}));

describe("Providers", () => {
  it("should render children", () => {
    render(
      <Providers>
        <div data-testid="child-component">Test Content</div>
      </Providers>
    );
    expect(screen.getByTestId("child-component")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render ThemeProvider", () => {
    render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    );
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
  });

  it("should wrap children with ThemeProvider", () => {
    render(
      <Providers>
        <div data-testid="nested-child">Nested Content</div>
      </Providers>
    );

    const themeProvider = screen.getByTestId("theme-provider");
    const nestedChild = screen.getByTestId("nested-child");

    expect(themeProvider).toContainElement(nestedChild);
  });

  it("should render multiple children", () => {
    render(
      <Providers>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Providers>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
  });

  it("should handle component structure", () => {
    const { container } = render(
      <Providers>
        <main>
          <h1>Main Content</h1>
        </main>
      </Providers>
    );

    expect(container.querySelector("main")).toBeInTheDocument();
    expect(screen.getByText("Main Content")).toBeInTheDocument();
  });
});
