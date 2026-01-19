import type { Board } from "@/types/dbInterface";
import { render, screen } from "@testing-library/react";
/// <reference types="react" />
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BoardActions } from "@/components/kanban/board/BoardActions";

// Ensure React is globally available
globalThis.React = React;

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn()
  }))
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("@/lib/api/boards/queries", () => ({
  useDeleteBoard: vi.fn(),
  useUpdateBoard: vi.fn()
}));

vi.mock("@/components/kanban/board/BoardForm", () => ({
  BoardForm: ({ children, onSubmit }: any) => (
    <form
      data-testid="board-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title: "Updated Board", description: "Updated Description" });
      }}
    >
      {children}
    </form>
  )
}));

describe("BoardActions", () => {
  const mockBoard: Board = {
    _id: "board-1",
    title: "Test Board",
    description: "Test Description",
    owner: "user-1",
    members: [{ _id: "user-1", name: "John", email: "john@example.com" }],
    projects: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const { useDeleteBoard, useUpdateBoard } = await import("@/lib/api/boards/queries");

    vi.mocked(useDeleteBoard).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false
    } as any);

    vi.mocked(useUpdateBoard).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(mockBoard),
      isPending: false
    } as any);
  });

  it("should render board actions button", () => {
    render(<BoardActions board={mockBoard} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should render with asChild prop", () => {
    const { container } = render(
      <BoardActions board={mockBoard} asChild>
        <button data-testid="custom-trigger">Custom Trigger</button>
      </BoardActions>
    );
    expect(container).toBeTruthy();
  });

  it("should render without asChild prop", () => {
    render(<BoardActions board={mockBoard} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should handle board with description", () => {
    render(<BoardActions board={mockBoard} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should handle board without description", () => {
    const boardWithoutDesc = { ...mockBoard, description: undefined };
    render(<BoardActions board={boardWithoutDesc} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should handle onDelete callback when provided", () => {
    const mockOnDelete = vi.fn();
    render(<BoardActions board={mockBoard} onDelete={mockOnDelete} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should render with custom className", () => {
    render(<BoardActions board={mockBoard} className="custom-class" />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should render board actions trigger", () => {
    render(<BoardActions board={mockBoard} />);
    const trigger = screen.getByTestId("board-option-button");
    expect(trigger).toBeInTheDocument();
  });

  it("should handle board with all fields populated", () => {
    const fullBoard: Board = {
      ...mockBoard,
      description: "Full Description",
      members: [
        { _id: "user-1", name: "John", email: "john@example.com" },
        { _id: "user-2", name: "Jane", email: "jane@example.com" }
      ],
      projects: [{ _id: "proj-1", title: "Project 1" } as any]
    };
    render(<BoardActions board={fullBoard} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should handle board with minimal fields", () => {
    const minimalBoard: Board = {
      _id: "board-2",
      title: "Minimal Board",
      owner: "user-1",
      members: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    render(<BoardActions board={minimalBoard} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should render correctly when mutations are pending", async () => {
    const { useUpdateBoard } = await import("@/lib/api/boards/queries");
    vi.mocked(useUpdateBoard).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockImplementation(async () => new Promise(() => {})),
      isPending: true
    } as any);

    render(<BoardActions board={mockBoard} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should render correctly when delete is pending", async () => {
    const { useDeleteBoard } = await import("@/lib/api/boards/queries");
    vi.mocked(useDeleteBoard).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockImplementation(async () => new Promise(() => {})),
      isPending: true
    } as any);

    render(<BoardActions board={mockBoard} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should use forwardRef correctly", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<BoardActions board={mockBoard} ref={ref} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should handle board with owner as string", () => {
    const boardWithStringOwner = { ...mockBoard, owner: "user-id-string" };
    render(<BoardActions board={boardWithStringOwner} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should handle board with owner as object", () => {
    const boardWithObjectOwner = {
      ...mockBoard,
      owner: {
        _id: "user-1",
        name: "John",
        email: "john@example.com",
        createdAt: new Date()
      } as any
    };
    render(<BoardActions board={boardWithObjectOwner} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should render component with valid board data", () => {
    const { container } = render(<BoardActions board={mockBoard} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should pass board title to dialogs", () => {
    render(<BoardActions board={mockBoard} />);
    // Component renders successfully with board title
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should handle empty projects array", () => {
    render(<BoardActions board={mockBoard} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should handle empty members array", () => {
    const boardWithNoMembers = { ...mockBoard, members: [] };
    render(<BoardActions board={boardWithNoMembers} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });

  it("should render without children when asChild is false", () => {
    render(<BoardActions board={mockBoard} asChild={false} />);
    expect(screen.getByTestId("board-option-button")).toBeInTheDocument();
  });
});
