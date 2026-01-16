import { render, screen } from "@testing-library/react"
/// <reference types="react" />
import React from "react"
import { describe, expect, it, vi } from "vitest"

import PageContainer from "@/components/layout/PageContainer"

globalThis.React = React

vi.mock("@repo/ui/components/scroll-area", () => ({
  ScrollArea: ({ children, className }: any) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  )
}))

describe("PageContainer", () => {
  it("should render page container", () => {
    render(
      <PageContainer>
        <div>Test Content</div>
      </PageContainer>
    )
    expect(screen.getByTestId("page-container")).toBeInTheDocument()
  })

  it("should render children", () => {
    render(
      <PageContainer>
        <div data-testid="child-content">Child Content</div>
      </PageContainer>
    )
    expect(screen.getByTestId("child-content")).toBeInTheDocument()
  })

  it("should render with scrollable by default", () => {
    render(
      <PageContainer>
        <div>Test</div>
      </PageContainer>
    )
    expect(screen.getByTestId("scroll-area")).toBeInTheDocument()
  })

  it("should render with scrollable=true", () => {
    render(
      <PageContainer scrollable={true}>
        <div>Test</div>
      </PageContainer>
    )
    expect(screen.getByTestId("scroll-area")).toBeInTheDocument()
    expect(screen.getByTestId("content-area")).toBeInTheDocument()
  })

  it("should render without scroll area when scrollable=false", () => {
    render(
      <PageContainer scrollable={false}>
        <div>Test</div>
      </PageContainer>
    )
    expect(screen.queryByTestId("scroll-area")).not.toBeInTheDocument()
    expect(screen.getByTestId("content-area")).toBeInTheDocument()
  })

  it("should apply correct classes to content area", () => {
    render(
      <PageContainer scrollable={false}>
        <div>Test</div>
      </PageContainer>
    )
    const contentArea = screen.getByTestId("content-area")
    expect(contentArea).toHaveClass("h-full", "px-4", "sm:px-6")
  })
})
