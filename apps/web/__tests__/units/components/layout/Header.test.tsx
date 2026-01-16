import { render, screen } from "@testing-library/react"
/// <reference types="react" />
import React from "react"
import { describe, expect, it, vi } from "vitest"

import Header from "@/components/layout/Header"

globalThis.React = React

vi.mock("@/components/layout/Breadcrumbs", () => ({
  Breadcrumbs: () => <div data-testid="breadcrumbs">Breadcrumbs</div>
}))

vi.mock("@/components/layout/LanguageSwitcher", () => ({
  default: () => <div data-testid="language-switcher">Language</div>
}))

vi.mock("@/components/layout/ThemeToggle", () => ({
  default: () => <div data-testid="theme-toggle">Theme</div>
}))

vi.mock("@/components/layout/UserNav", () => ({
  UserNav: () => <div data-testid="user-nav">User</div>
}))

vi.mock("@repo/ui/components/separator", () => ({
  Separator: () => <div data-testid="separator">|</div>
}))

vi.mock("@repo/ui/components/sidebar", () => ({
  SidebarTrigger: () => <button data-testid="sidebar-trigger">Toggle</button>
}))

describe("Header", () => {
  it("should render header", () => {
    const { container } = render(<Header />)
    expect(container.querySelector("header")).toBeInTheDocument()
  })

  it("should render sidebar trigger", () => {
    render(<Header />)
    expect(screen.getByTestId("sidebar-trigger")).toBeInTheDocument()
  })

  it("should render separator", () => {
    render(<Header />)
    expect(screen.getByTestId("separator")).toBeInTheDocument()
  })

  it("should render breadcrumbs", () => {
    render(<Header />)
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument()
  })

  it("should render user nav", () => {
    render(<Header />)
    expect(screen.getByTestId("user-nav")).toBeInTheDocument()
  })

  it("should render theme toggle", () => {
    render(<Header />)
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument()
  })

  it("should render language switcher", () => {
    render(<Header />)
    expect(screen.getByTestId("language-switcher")).toBeInTheDocument()
  })

  it("should render all header components", () => {
    render(<Header />)
    expect(screen.getByTestId("sidebar-trigger")).toBeInTheDocument()
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument()
    expect(screen.getByTestId("user-nav")).toBeInTheDocument()
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument()
    expect(screen.getByTestId("language-switcher")).toBeInTheDocument()
  })
})
