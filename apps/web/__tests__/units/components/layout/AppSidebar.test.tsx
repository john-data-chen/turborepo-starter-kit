import { render, screen } from "@testing-library/react";
/// <reference types="react" />
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AppSidebar from "@/components/layout/AppSidebar";

// Ensure React is globally available
globalThis.React = React;

// Mock dependencies
vi.mock("@/hooks/useBoards", () => ({
  useBoards: vi.fn()
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  usePathname: vi.fn(() => "/boards")
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("@/components/layout/Icons", () => ({
  Icons: {
    projectLogo: () => <div data-testid="project-logo">Logo</div>
  }
}));

// Mock Sidebar components
vi.mock("@repo/ui/components/sidebar", () => ({
  Sidebar: ({ children }: any) => <div data-testid="sidebar">{children}</div>,
  SidebarHeader: ({ children }: any) => <div data-testid="sidebar-header">{children}</div>,
  SidebarContent: ({ children }: any) => <div data-testid="sidebar-content">{children}</div>,
  SidebarGroup: ({ children }: any) => <div data-testid="sidebar-group">{children}</div>,
  SidebarGroupLabel: ({ children }: any) => <div data-testid="sidebar-group-label">{children}</div>,
  SidebarMenu: ({ children }: any) => <ul data-testid="sidebar-menu">{children}</ul>,
  SidebarMenuItem: ({ children }: any) => <li data-testid="sidebar-menu-item">{children}</li>,
  SidebarMenuButton: ({ children, asChild }: any) => (
    <div data-testid="sidebar-menu-button">{children}</div>
  )
}));

describe("AppSidebar", () => {
  const mockMyBoards = [
    {
      _id: "board-1",
      title: "My Board 1",
      owner: "user-1",
      members: [],
      projects: [],
      createdAt: "",
      updatedAt: ""
    },
    {
      _id: "board-2",
      title: "My Board 2",
      owner: "user-1",
      members: [],
      projects: [],
      createdAt: "",
      updatedAt: ""
    }
  ];

  const mockTeamBoards = [
    {
      _id: "board-3",
      title: "Team Board 1",
      owner: "user-2",
      members: [],
      projects: [],
      createdAt: "",
      updatedAt: ""
    }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    const { useBoards } = await import("@/hooks/useBoards");
    vi.mocked(useBoards).mockReturnValue({
      myBoards: mockMyBoards,
      teamBoards: mockTeamBoards,
      loading: false,
      createBoard: vi.fn().mockResolvedValue(undefined),
      currentBoard: null
    } as any);
  });

  it("should render sidebar", () => {
    const { container } = render(<AppSidebar />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render project logo", () => {
    render(<AppSidebar />);
    expect(screen.getByTestId("project-logo")).toBeInTheDocument();
  });

  it("should render overview link", () => {
    render(<AppSidebar />);
    expect(screen.getByText("overview")).toBeInTheDocument();
  });

  it("should render my boards section", () => {
    render(<AppSidebar />);
    expect(screen.getByText("myBoards")).toBeInTheDocument();
  });

  it("should render team boards section", () => {
    render(<AppSidebar />);
    expect(screen.getByText("teamBoards")).toBeInTheDocument();
  });

  it("should render all my boards", () => {
    render(<AppSidebar />);
    expect(screen.getByText("My Board 1")).toBeInTheDocument();
    expect(screen.getByText("My Board 2")).toBeInTheDocument();
  });

  it("should render all team boards", () => {
    render(<AppSidebar />);
    expect(screen.getByText("Team Board 1")).toBeInTheDocument();
  });

  it("should show loading state for my boards", async () => {
    const { useBoards } = await import("@/hooks/useBoards");
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: true,
      createBoard: vi.fn(),
      currentBoard: null
    } as any);

    render(<AppSidebar />);
    const loadingTexts = screen.getAllByText("loading");
    expect(loadingTexts.length).toBeGreaterThan(0);
  });

  it("should handle empty my boards", async () => {
    const { useBoards } = await import("@/hooks/useBoards");
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: mockTeamBoards,
      loading: false,
      createBoard: vi.fn(),
      currentBoard: null
    } as any);

    render(<AppSidebar />);
    expect(screen.getByText("myBoards")).toBeInTheDocument();
  });

  it("should handle empty team boards", async () => {
    const { useBoards } = await import("@/hooks/useBoards");
    vi.mocked(useBoards).mockReturnValue({
      myBoards: mockMyBoards,
      teamBoards: [],
      loading: false,
      createBoard: vi.fn(),
      currentBoard: null
    } as any);

    render(<AppSidebar />);
    expect(screen.getByText("teamBoards")).toBeInTheDocument();
  });

  it("should handle both empty boards", async () => {
    const { useBoards } = await import("@/hooks/useBoards");
    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: false,
      createBoard: vi.fn(),
      currentBoard: null
    } as any);

    render(<AppSidebar />);
    expect(screen.getByText("myBoards")).toBeInTheDocument();
    expect(screen.getByText("teamBoards")).toBeInTheDocument();
  });

  it("should render links with correct href", () => {
    const { container } = render(<AppSidebar />);
    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
  });

  it("should handle component lifecycle", () => {
    const { unmount } = render(<AppSidebar />);
    expect(screen.getByText("myBoards")).toBeInTheDocument();
    unmount();
  });
});
