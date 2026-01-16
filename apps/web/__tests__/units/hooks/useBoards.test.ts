import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBoards } from "@/hooks/useBoards";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Board } from "@/types/dbInterface";

// Mock the API queries
vi.mock("@/lib/api/boards/queries", () => ({
  useBoards: vi.fn()
}));

describe("useBoards", () => {
  beforeEach(() => {
    // Reset the workspace store before each test
    useWorkspaceStore.setState({
      userId: "user-123",
      userEmail: "test@example.com",
      myBoards: [],
      teamBoards: [],
      projects: [],
      isLoadingProjects: false,
      currentBoardId: null,
      filter: {
        status: null,
        search: ""
      }
    });
    vi.clearAllMocks();
  });

  it("should return empty arrays when no data is available", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");
    vi.mocked(useApiBoards).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useBoards());

    expect(result.current.myBoards).toEqual([]);
    expect(result.current.teamBoards).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("should split boards by ownership when receiving a flat array", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");

    const mockBoards: Board[] = [
      {
        _id: "board-1",
        title: "My Board",
        description: "My board description",
        owner: "user-123",
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: "board-2",
        title: "Team Board",
        description: "Team board description",
        owner: "user-456",
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    vi.mocked(useApiBoards).mockReturnValue({
      data: mockBoards,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useBoards());

    await waitFor(() => {
      expect(result.current.myBoards).toHaveLength(1);
      expect(result.current.teamBoards).toHaveLength(1);
    });

    expect(result.current.myBoards[0]._id).toBe("board-1");
    expect(result.current.teamBoards[0]._id).toBe("board-2");
  });

  it("should use separate myBoards and teamBoards from API response", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");

    const mockMyBoards: Board[] = [
      {
        _id: "board-1",
        title: "My Board",
        description: "My board description",
        owner: "user-123",
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const mockTeamBoards: Board[] = [
      {
        _id: "board-2",
        title: "Team Board",
        description: "Team board description",
        owner: "user-456",
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    vi.mocked(useApiBoards).mockReturnValue({
      data: { myBoards: mockMyBoards, teamBoards: mockTeamBoards },
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useBoards());

    await waitFor(() => {
      expect(result.current.myBoards).toHaveLength(1);
      expect(result.current.teamBoards).toHaveLength(1);
    });

    expect(result.current.myBoards[0]._id).toBe("board-1");
    expect(result.current.teamBoards[0]._id).toBe("board-2");
  });

  it("should normalize boards with missing members and projects", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");

    const mockBoards: Partial<Board>[] = [
      {
        _id: "board-1",
        title: "My Board",
        description: "My board description",
        owner: "user-123",
        // members and projects are missing
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    vi.mocked(useApiBoards).mockReturnValue({
      data: mockBoards as Board[],
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useBoards());

    await waitFor(() => {
      expect(result.current.myBoards).toHaveLength(1);
    });

    expect(result.current.myBoards[0].members).toEqual([]);
    expect(result.current.myBoards[0].projects).toEqual([]);
  });

  it("should handle owner as object reference", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");

    const mockBoards: Board[] = [
      {
        _id: "board-1",
        title: "My Board",
        description: "My board description",
        owner: { _id: "user-123", name: "Test User", email: "test@example.com" },
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    vi.mocked(useApiBoards).mockReturnValue({
      data: mockBoards,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useBoards());

    await waitFor(() => {
      expect(result.current.myBoards).toHaveLength(1);
    });

    expect(result.current.myBoards[0]._id).toBe("board-1");
  });

  it("should update workspace store when boards change", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");

    const mockMyBoards: Board[] = [
      {
        _id: "board-1",
        title: "My Board",
        description: "My board description",
        owner: "user-123",
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    vi.mocked(useApiBoards).mockReturnValue({
      data: { myBoards: mockMyBoards, teamBoards: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    renderHook(() => useBoards());

    await waitFor(() => {
      const state = useWorkspaceStore.getState();
      expect(state.myBoards).toHaveLength(1);
      expect(state.myBoards[0]._id).toBe("board-1");
    });
  });

  it("should return loading state", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");

    vi.mocked(useApiBoards).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useBoards());

    expect(result.current.loading).toBe(true);
  });

  it("should return error state", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");

    const mockError = new Error("Failed to fetch boards");

    vi.mocked(useApiBoards).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useBoards());

    expect(result.current.error).toBe(mockError);
  });

  it("should provide refresh function", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");

    const mockRefetch = vi.fn();

    vi.mocked(useApiBoards).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    const { result } = renderHook(() => useBoards());

    result.current.refresh();

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should handle empty myBoards and teamBoards from API", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");

    vi.mocked(useApiBoards).mockReturnValue({
      data: { myBoards: [], teamBoards: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useBoards());

    await waitFor(() => {
      expect(result.current.myBoards).toEqual([]);
      expect(result.current.teamBoards).toEqual([]);
    });
  });

  it("should handle null values for myBoards and teamBoards from API", async () => {
    const { useBoards: useApiBoards } = await import("@/lib/api/boards/queries");

    vi.mocked(useApiBoards).mockReturnValue({
      data: { myBoards: null, teamBoards: null },
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    const { result } = renderHook(() => useBoards());

    await waitFor(() => {
      expect(result.current.myBoards).toEqual([]);
      expect(result.current.teamBoards).toEqual([]);
    });
  });
});
