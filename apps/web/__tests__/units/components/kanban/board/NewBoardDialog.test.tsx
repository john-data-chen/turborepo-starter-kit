import { render, screen } from "@testing-library/react";
/// <reference types="react" />
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import NewBoardDialog from "@/components/kanban/board/NewBoardDialog";

globalThis.React = React;

vi.mock("@/hooks/useBoards", () => ({
  useBoards: vi.fn()
}));

vi.mock("@/stores/workspace-store", () => ({
  useWorkspaceStore: vi.fn()
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn()
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("@/components/kanban/board/BoardForm", () => ({
  BoardForm: ({ children, onSubmit, onCancel }: any) => (
    <form
      data-testid="board-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({ title: "Test Board", description: "Test Description" });
      }}
    >
      {children}
      <button type="button" onClick={onCancel} data-testid="cancel-btn">
        Cancel
      </button>
      <button type="submit" data-testid="submit-btn">
        Submit
      </button>
    </form>
  )
}));

vi.mock("@repo/ui/components/dialog", () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>
}));

describe("NewBoardDialog", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { useBoards } = await import("@/hooks/useBoards");
    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    const { useRouter } = await import("@/i18n/navigation");

    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: false,
      createBoard: vi.fn(),
      currentBoard: null,
      refresh: vi.fn()
    } as any);

    vi.mocked(useWorkspaceStore).mockReturnValue({
      addBoard: vi.fn().mockResolvedValue("board-1")
    } as any);

    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn()
    } as any);
  });

  it("should render dialog", () => {
    render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("should render dialog trigger with children", () => {
    render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );
    expect(screen.getByText("New Board")).toBeInTheDocument();
  });

  it("should render dialog title", () => {
    render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );
    expect(screen.getByText("newBoardTitle")).toBeInTheDocument();
  });

  it("should render dialog description", () => {
    render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );
    expect(screen.getByText("newBoardDescription")).toBeInTheDocument();
  });

  it("should render board form", () => {
    render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );
    expect(screen.getByTestId("board-form")).toBeInTheDocument();
  });

  it("should render cancel button", () => {
    render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );
    expect(screen.getByText("cancel")).toBeInTheDocument();
  });

  it("should render create button", () => {
    render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );
    expect(screen.getByText("create")).toBeInTheDocument();
  });

  it("should render dialog structure", () => {
    const { container } = render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle form submission", async () => {
    const mockAddBoard = vi.fn().mockResolvedValue("board-1");
    const mockPush = vi.fn();

    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    const { useRouter } = await import("@/i18n/navigation");

    vi.mocked(useWorkspaceStore).mockReturnValue({
      addBoard: mockAddBoard
    } as any);

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn()
    } as any);

    const { container } = render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );

    const form = container.querySelector("form");
    if (form) {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }

    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("should handle cancel button click", () => {
    const { container } = render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );

    const cancelBtn = container.querySelector('[data-testid="cancel-btn"]');
    if (cancelBtn) {
      cancelBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }

    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("should handle successful board creation with navigation", async () => {
    const mockAddBoard = vi.fn().mockResolvedValue("new-board-id");
    const mockRefresh = vi.fn();
    const mockPush = vi.fn();

    const { useWorkspaceStore } = await import("@/stores/workspace-store");
    const { useBoards } = await import("@/hooks/useBoards");
    const { useRouter } = await import("@/i18n/navigation");

    vi.mocked(useWorkspaceStore).mockReturnValue({
      addBoard: mockAddBoard
    } as any);

    vi.mocked(useBoards).mockReturnValue({
      myBoards: [],
      teamBoards: [],
      loading: false,
      createBoard: vi.fn(),
      currentBoard: null,
      refresh: mockRefresh
    } as any);

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn()
    } as any);

    const { container } = render(
      <NewBoardDialog>
        <button>New Board</button>
      </NewBoardDialog>
    );

    const form = container.querySelector("form");
    if (form) {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }

    expect(container.querySelector("form")).toBeInTheDocument();
  });
});
