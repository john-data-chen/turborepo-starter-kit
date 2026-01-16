import { render, screen } from "@testing-library/react"
/// <reference types="react" />
import React from "react"
import { describe, expect, it, vi } from "vitest"

import ThemeProvider from "@/components/layout/ThemeProvider"

globalThis.React = React

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>
}))

describe("ThemeProvider", () => {
  it("should render theme provider", () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    )
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument()
  })

  it("should render children", () => {
    render(
      <ThemeProvider>
        <div data-testid="child-content">Child Content</div>
      </ThemeProvider>
    )
    expect(screen.getByTestId("child-content")).toBeInTheDocument()
  })

  it("should pass props to NextThemesProvider", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div>Test</div>
      </ThemeProvider>
    )
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument()
  })
})
