import { render, screen } from "@testing-library/react";
/// <reference types="react" />
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

// Ensure React is globally available
globalThis.React = React;

// Mock dependencies
vi.mock("@/hooks/useBreadcrumbs", () => ({
  useBreadcrumbs: vi.fn()
}));

// Mock Breadcrumb components
vi.mock("@repo/ui/components/breadcrumb", () => ({
  Breadcrumb: ({ children }: any) => (
    <nav aria-label="breadcrumb" data-testid="breadcrumb">
      {children}
    </nav>
  ),
  BreadcrumbList: ({ children }: any) => <ol data-testid="breadcrumb-list">{children}</ol>,
  BreadcrumbItem: ({ children }: any) => <li data-testid="breadcrumb-item">{children}</li>,
  BreadcrumbLink: ({ children, href }: any) => (
    <div data-href={href} data-testid="breadcrumb-link">
      {children}
    </div>
  ),
  BreadcrumbSeparator: ({ children }: any) => (
    <span data-testid="breadcrumb-separator">{children || "/"}</span>
  ),
  BreadcrumbEllipsis: () => <span data-testid="breadcrumb-ellipsis">...</span>
}));

describe("Breadcrumbs", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { useBreadcrumbs } = await import("@/hooks/useBreadcrumbs");
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [
        { title: "Home", link: "/" },
        { title: "Boards", link: "/boards" },
        { title: "Board 1", link: "/boards/1" }
      ],
      rootLink: "/"
    });
  });

  it("should render breadcrumbs", () => {
    const { container } = render(<Breadcrumbs />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render all breadcrumb items", () => {
    const { container } = render(<Breadcrumbs />);
    const links = container.querySelectorAll("[data-href]");
    // Should have 3 breadcrumb links
    expect(links.length).toBeGreaterThanOrEqual(3);
  });

  it("should render single breadcrumb item", async () => {
    const { useBreadcrumbs } = await import("@/hooks/useBreadcrumbs");
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [{ title: "Home", link: "/" }],
      rootLink: "/"
    });

    render(<Breadcrumbs />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should handle minimal breadcrumbs with one item", async () => {
    const { useBreadcrumbs } = await import("@/hooks/useBreadcrumbs");
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [{ title: "Home", link: "/" }],
      rootLink: "/"
    });

    const { container } = render(<Breadcrumbs />);
    expect(container.querySelector("nav")).toBeTruthy();
  });

  it("should render multiple breadcrumb items", async () => {
    const { useBreadcrumbs } = await import("@/hooks/useBreadcrumbs");
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [
        { title: "Level 1", link: "/level1" },
        { title: "Level 2", link: "/level1/level2" },
        { title: "Level 3", link: "/level1/level2/level3" },
        { title: "Level 4", link: "/level1/level2/level3/level4" }
      ],
      rootLink: "/level1"
    });

    const { container } = render(<Breadcrumbs />);
    const links = container.querySelectorAll("[data-href]");
    expect(links.length).toBeGreaterThanOrEqual(4);
  });

  it("should handle special characters in breadcrumb titles", async () => {
    const { useBreadcrumbs } = await import("@/hooks/useBreadcrumbs");
    vi.mocked(useBreadcrumbs).mockReturnValue({
      items: [{ title: "Board & Project", link: "/board-1" }],
      rootLink: "/"
    });

    render(<Breadcrumbs />);
    expect(screen.getByText("Board & Project")).toBeInTheDocument();
  });

  it("should render component structure", () => {
    const { container } = render(<Breadcrumbs />);
    expect(container.querySelector("nav")).toBeTruthy();
  });

  it("should handle component lifecycle", () => {
    const { unmount } = render(<Breadcrumbs />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    unmount();
  });
});
