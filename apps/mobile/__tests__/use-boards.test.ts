import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  useBoards,
  useBoard,
  useCreateBoard,
  useUpdateBoard,
  useDeleteBoard
} from "@/hooks/use-boards";
import { boardApi } from "@/lib/api/board-api";

import { Wrapper } from "./test-utils";

vi.mock("@/lib/api/board-api", () => ({
  boardApi: {
    getBoards: vi.fn(),
    getBoardById: vi.fn(),
    createBoard: vi.fn(),
    updateBoard: vi.fn(),
    deleteBoard: vi.fn()
  }
}));

describe("useBoards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch boards", async () => {
    const mockBoards = [{ _id: "b1", title: "Board 1" }];
    vi.mocked(boardApi.getBoards).mockResolvedValue(mockBoards as any);

    const { result } = renderHook(() => useBoards(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBoards);
    expect(boardApi.getBoards).toHaveBeenCalled();
  });
});

describe("useBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch a single board by id", async () => {
    const mockBoard = { _id: "b1", title: "Board 1" };
    vi.mocked(boardApi.getBoardById).mockResolvedValue(mockBoard as any);

    const { result } = renderHook(() => useBoard("b1"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBoard);
  });

  it("should not fetch when boardId is undefined", () => {
    const { result } = renderHook(() => useBoard(undefined), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(boardApi.getBoardById).not.toHaveBeenCalled();
  });
});

describe("useCreateBoard", () => {
  it("should call boardApi.createBoard", async () => {
    const newBoard = { _id: "b2", title: "New Board" };
    vi.mocked(boardApi.createBoard).mockResolvedValue(newBoard as any);

    const { result } = renderHook(() => useCreateBoard(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ title: "New Board" } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(boardApi.createBoard).toHaveBeenCalledWith({ title: "New Board" }, expect.anything());
  });
});

describe("useUpdateBoard", () => {
  it("should call boardApi.updateBoard with id and updates", async () => {
    const updated = { _id: "b1", title: "Updated" };
    vi.mocked(boardApi.updateBoard).mockResolvedValue(updated as any);

    const { result } = renderHook(() => useUpdateBoard(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "b1", title: "Updated" } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(boardApi.updateBoard).toHaveBeenCalledWith("b1", { title: "Updated" });
  });
});

describe("useDeleteBoard", () => {
  it("should call boardApi.deleteBoard", async () => {
    vi.mocked(boardApi.deleteBoard).mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useDeleteBoard(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate("b1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(boardApi.deleteBoard).toHaveBeenCalledWith("b1", expect.anything());
  });
});
