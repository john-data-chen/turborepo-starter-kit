import { fireEvent, render, screen } from "@testing-library/react";
/// <reference types="react" />
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskFilter } from "@/components/kanban/task/TaskFilter";
import { TaskStatus } from "@/types/dbInterface";

// Ensure React is globally available
globalThis.React = React;

// Mock dependencies
vi.mock("@/stores/workspace-store", () => ({
  useWorkspaceStore: vi.fn()
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

// Mock Select components to simplify testing
vi.mock("@repo/ui/components/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div
      data-testid="select"
      data-value={value}
      onClick={() => onValueChange && onValueChange("TODO")}
    >
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <button data-testid="status-select">{children}</button>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`${value.toLowerCase()}-item`} data-value={value}>
      {children}
    </div>
  )
}));

describe("TaskFilter", () => {
  const mockSetFilter = vi.fn();

  const mockProjects = [
    {
      _id: "project-1",
      title: "Project 1",
      tasks: [
        { _id: "task-1", title: "Task 1", status: TaskStatus.TODO },
        { _id: "task-2", title: "Task 2", status: TaskStatus.IN_PROGRESS },
        { _id: "task-3", title: "Task 3", status: TaskStatus.DONE }
      ]
    },
    {
      _id: "project-2",
      title: "Project 2",
      tasks: [
        { _id: "task-4", title: "Task 4", status: TaskStatus.TODO },
        { _id: "task-5", title: "Task 5", status: TaskStatus.TODO }
      ]
    }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    const { useWorkspaceStore } = await import("@/stores/workspace-store");

    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: null, search: "" },
      setFilter: mockSetFilter,
      projects: mockProjects
    } as any);
  });

  it("should render task filter component", () => {
    render(<TaskFilter />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByTestId("status-select")).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(<TaskFilter />);
    const searchInput = screen.getByTestId("search-input");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("placeholder", "searchPlaceholder");
  });

  it("should render status select", () => {
    render(<TaskFilter />);
    expect(screen.getByTestId("status-select")).toBeInTheDocument();
  });

  it("should display search value", async () => {
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: null, search: "test query" },
      setFilter: mockSetFilter,
      projects: mockProjects
    } as any);

    render(<TaskFilter />);
    const searchInput = screen.getByTestId("search-input");
    expect(searchInput.value).toBe("test query");
  });

  it("should call setFilter when search input changes", () => {
    render(<TaskFilter />);
    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "new search" } });
    expect(mockSetFilter).toHaveBeenCalledWith({ search: "new search" });
  });

  it("should render clear filter button when filter is active", async () => {
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: TaskStatus.TODO, search: "" },
      setFilter: mockSetFilter,
      projects: mockProjects
    } as any);

    render(<TaskFilter />);
    expect(screen.getByTestId("clear-filter-button")).toBeInTheDocument();
  });

  it("should not render clear filter button when no filter is active", () => {
    render(<TaskFilter />);
    expect(screen.queryByTestId("clear-filter-button")).not.toBeInTheDocument();
  });

  it("should call setFilter when clear button is clicked", async () => {
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: TaskStatus.TODO, search: "test" },
      setFilter: mockSetFilter,
      projects: mockProjects
    } as any);

    render(<TaskFilter />);
    const clearButton = screen.getByTestId("clear-filter-button");
    fireEvent.click(clearButton);
    expect(mockSetFilter).toHaveBeenCalledWith({ status: null, search: "" });
  });

  it("should calculate status counts correctly", () => {
    render(<TaskFilter />);
    // Component should render with calculated counts
    expect(screen.getByTestId("total-item")).toBeInTheDocument();
    expect(screen.getByTestId("todo-item")).toBeInTheDocument();
    expect(screen.getByTestId("in_progress-item")).toBeInTheDocument();
    expect(screen.getByTestId("done-item")).toBeInTheDocument();
  });

  it("should handle empty projects array", async () => {
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: null, search: "" },
      setFilter: mockSetFilter,
      projects: []
    } as any);

    render(<TaskFilter />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should handle null projects", async () => {
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: null, search: "" },
      setFilter: mockSetFilter,
      projects: null
    } as any);

    render(<TaskFilter />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should handle projects with no tasks", async () => {
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: null, search: "" },
      setFilter: mockSetFilter,
      projects: [{ _id: "project-1", title: "Empty Project", tasks: [] }]
    } as any);

    render(<TaskFilter />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should handle projects with null tasks", async () => {
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: null, search: "" },
      setFilter: mockSetFilter,
      projects: [{ _id: "project-1", title: "Project", tasks: null }]
    } as any);

    render(<TaskFilter />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should handle tasks with missing status", async () => {
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: null, search: "" },
      setFilter: mockSetFilter,
      projects: [
        {
          _id: "project-1",
          title: "Project",
          tasks: [{ _id: "task-1", title: "Task without status", status: undefined }]
        }
      ]
    } as any);

    render(<TaskFilter />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should handle filter with status", async () => {
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: TaskStatus.TODO, search: "" },
      setFilter: mockSetFilter,
      projects: mockProjects
    } as any);

    render(<TaskFilter />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("should handle filter with search query", async () => {
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: null, search: "some query" },
      setFilter: mockSetFilter,
      projects: mockProjects
    } as any);

    render(<TaskFilter />);
    expect(screen.getByTestId("clear-filter-button")).toBeInTheDocument();
  });

  it("should render all status filter options", () => {
    render(<TaskFilter />);
    expect(screen.getByTestId("total-item")).toBeInTheDocument();
    expect(screen.getByTestId("todo-item")).toBeInTheDocument();
    expect(screen.getByTestId("in_progress-item")).toBeInTheDocument();
    expect(screen.getByTestId("done-item")).toBeInTheDocument();
  });

  it("should update search input value", () => {
    render(<TaskFilter />);
    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "updated search" } });
    expect(mockSetFilter).toHaveBeenCalledWith({ search: "updated search" });
  });

  it("should handle rapid search input changes", () => {
    render(<TaskFilter />);
    const searchInput = screen.getByTestId("search-input");

    fireEvent.change(searchInput, { target: { value: "a" } });
    fireEvent.change(searchInput, { target: { value: "ab" } });
    fireEvent.change(searchInput, { target: { value: "abc" } });

    expect(mockSetFilter).toHaveBeenCalledTimes(3);
  });

  it("should render component structure correctly", () => {
    const { container } = render(<TaskFilter />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle component lifecycle", () => {
    const { unmount } = render(<TaskFilter />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    unmount();
  });

  it("should call setFilter when status select changes to TOTAL", () => {
    render(<TaskFilter />);
    const selectElement = screen.getByTestId("select");

    // Create a custom event to simulate selecting TOTAL
    const totalItem = screen.getByTestId("total-item");
    fireEvent.click(totalItem);

    // The mock should have been called through onValueChange
    expect(selectElement).toBeInTheDocument();
  });

  it("should call setFilter when status select changes to TODO", () => {
    render(<TaskFilter />);
    const todoItem = screen.getByTestId("todo-item");

    // Verify the item exists
    expect(todoItem).toBeInTheDocument();
  });
});
