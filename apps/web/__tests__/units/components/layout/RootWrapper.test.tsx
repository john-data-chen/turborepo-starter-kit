import { render, screen } from "@testing-library/react"
/// <reference types="react" />
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import RootWrapper from "@/components/layout/RootWrapper"

globalThis.React = React

vi.mock("@/components/layout/AppSidebar", () => ({
  default: () => <div data-testid="app-sidebar">Sidebar</div>
}))

vi.mock("@/components/layout/Header", () => ({
  default: () => <div data-testid="header">Header</div>
}))

vi.mock("@/constants/ui", () => ({
  TOAST_DURATION: 3000
}))

vi.mock("@repo/ui/components/sidebar", () => ({
  SidebarProvider: ({ children }: any) => <div data-testid="sidebar-provider">{children}</div>,
  SidebarInset: ({ children }: any) => <div data-testid="sidebar-inset">{children}</div>
}))

vi.mock("sonner", () => ({
  Toaster: (props: any) => (
    <div data-testid="toaster" data-position={props.position}>
      Toaster
    </div>
  )
}))

describe("RootWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render root wrapper", () => {
    const { container } = render(
      <RootWrapper>
        <div>Test Content</div>
      </RootWrapper>
    )
    expect(container.firstChild).toBeTruthy()
  })

  it("should render children", () => {
    render(
      <RootWrapper>
        <div data-testid="child-content">Child Content</div>
      </RootWrapper>
    )
    expect(screen.getByTestId("child-content")).toBeInTheDocument()
  })

  it("should render sidebar provider", () => {
    render(
      <RootWrapper>
        <div>Test</div>
      </RootWrapper>
    )
    expect(screen.getByTestId("sidebar-provider")).toBeInTheDocument()
  })

  it("should render app sidebar", () => {
    render(
      <RootWrapper>
        <div>Test</div>
      </RootWrapper>
    )
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
  })

  it("should render sidebar inset", () => {
    render(
      <RootWrapper>
        <div>Test</div>
      </RootWrapper>
    )
    expect(screen.getByTestId("sidebar-inset")).toBeInTheDocument()
  })

  it("should render header", () => {
    render(
      <RootWrapper>
        <div>Test</div>
      </RootWrapper>
    )
    expect(screen.getByTestId("header")).toBeInTheDocument()
  })

  it("should render toaster", () => {
    render(
      <RootWrapper>
        <div>Test</div>
      </RootWrapper>
    )
    expect(screen.getByTestId("toaster")).toBeInTheDocument()
  })

  it("should render toaster with correct position", () => {
    render(
      <RootWrapper>
        <div>Test</div>
      </RootWrapper>
    )
    expect(screen.getByTestId("toaster")).toHaveAttribute("data-position", "bottom-right")
  })

  it("should render all root wrapper elements", () => {
    render(
      <RootWrapper>
        <div data-testid="content">Content</div>
      </RootWrapper>
    )
    expect(screen.getByTestId("sidebar-provider")).toBeInTheDocument()
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
    expect(screen.getByTestId("header")).toBeInTheDocument()
    expect(screen.getByTestId("toaster")).toBeInTheDocument()
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })
})
