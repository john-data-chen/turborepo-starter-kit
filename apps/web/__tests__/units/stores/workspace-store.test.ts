import { beforeEach, describe, expect, it, vi } from "vitest";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { TaskStatus, type Board, type Project } from "@/types/dbInterface";

// Mock the API modules
vi.mock("@/lib/api/boardApi", () => ({
  boardApi: {
    createBoard: vi.fn(),
    updateBoard: vi.fn(),
    deleteBoard: vi.fn()
  }
}));

vi.mock("@/lib/api/projectApi", () => ({
  projectApi: {
    getProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn()
  }
}));

vi.mock("@/lib/api/taskApi", () => ({
  taskApi: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn()
  }
}));

vi.mock("@/lib/api/tasks", () => ({
  useDeleteTask: vi.fn(() => ({
    mutateAsync: vi.fn()
  }))
}));

describe("workspace-store", () => {
  beforeEach(() => {
    // Reset the store before each test
    useWorkspaceStore.setState({
      userEmail: null,
      userId: null,
      projects: [],
      isLoadingProjects: false,
      currentBoardId: null,
      myBoards: [],
      teamBoards: [],
      filter: {
        status: null,
        search: ""
      }
    });
    vi.clearAllMocks();
  });

  describe("User actions", () => {
    it("should set user info correctly", () => {
      const store = useWorkspaceStore.getState();

      store.setUserInfo("test@example.com", "user-123");

      const state = useWorkspaceStore.getState();
      expect(state.userEmail).toBe("test@example.com");
      expect(state.userId).toBe("user-123");
    });

    it("should throw error when setting invalid user info", () => {
      const store = useWorkspaceStore.getState();

      expect(() => {
        store.setUserInfo("", "user-123");
      }).toThrow("Email and userId are required");
      expect(() => {
        store.setUserInfo("test@example.com", "");
      }).toThrow("Email and userId are required");
    });

    it("should not update if user info is the same", () => {
      const store = useWorkspaceStore.getState();

      store.setUserInfo("test@example.com", "user-123");
      const state1 = useWorkspaceStore.getState();

      store.setUserInfo("test@example.com", "user-123");
      const state2 = useWorkspaceStore.getState();

      expect(state1).toBe(state2);
    });
  });

  describe("Board actions", () => {
    it("should set current board id", () => {
      const store = useWorkspaceStore.getState();
      store.setCurrentBoardId("board-123");

      const state = useWorkspaceStore.getState();
      expect(state.currentBoardId).toBe("board-123");
    });

    it("should add a new board", async () => {
      const { boardApi } = await import("@/lib/api/boardApi");
      const mockBoard: Board = {
        _id: "board-new",
        title: "New Board",
        description: "New Description",
        owner: "user-1",
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      vi.mocked(boardApi.createBoard).mockResolvedValue(mockBoard);

      useWorkspaceStore.setState({
        userId: "user-1",
        myBoards: []
      });

      const store = useWorkspaceStore.getState();
      const boardId = await store.addBoard("New Board", "New Description");

      expect(boardId).toBe("board-new");
      const state = useWorkspaceStore.getState();
      expect(state.myBoards).toHaveLength(1);
      expect(state.myBoards[0].title).toBe("New Board");
    });

    it("should throw error when adding board without user authenticated", async () => {
      useWorkspaceStore.setState({
        userId: null
      });

      const store = useWorkspaceStore.getState();

      await expect(store.addBoard("New Board")).rejects.toMatchObject({
        message: expect.stringContaining("User not authenticated")
      });
    });

    it("should update a board", async () => {
      const { boardApi } = await import("@/lib/api/boardApi");
      const mockBoard: Board = {
        _id: "board-1",
        title: "Old Title",
        description: "Old Description",
        owner: "user-1",
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      useWorkspaceStore.setState({
        myBoards: [mockBoard]
      });

      vi.mocked(boardApi.updateBoard).mockResolvedValue({ ...mockBoard, title: "New Title" });

      const store = useWorkspaceStore.getState();
      await store.updateBoard("board-1", { title: "New Title" });

      const state = useWorkspaceStore.getState();
      expect(state.myBoards[0].title).toBe("New Title");
    });

    it("should remove a board", async () => {
      const mockBoard: Board = {
        _id: "board-1",
        title: "Board 1",
        description: "Description 1",
        owner: "user-1",
        members: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      useWorkspaceStore.setState({
        myBoards: [mockBoard],
        currentBoardId: "board-1"
      });

      const deleteFn = vi.fn().mockResolvedValue(undefined);

      const store = useWorkspaceStore.getState();
      await store.removeBoard("board-1", deleteFn);

      const state = useWorkspaceStore.getState();
      expect(state.myBoards).toHaveLength(0);
      expect(state.currentBoardId).toBeNull();
    });

    it("should set my boards", () => {
      const mockBoards: Board[] = [
        {
          _id: "board-1",
          title: "Board 1",
          description: "Description 1",
          owner: "user-1",
          members: [],
          projects: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const store = useWorkspaceStore.getState();
      store.setMyBoards(mockBoards);

      const state = useWorkspaceStore.getState();
      expect(state.myBoards).toEqual(mockBoards);
    });

    it("should set team boards", () => {
      const mockBoards: Board[] = [
        {
          _id: "board-1",
          title: "Board 1",
          description: "Description 1",
          owner: "user-2",
          members: [],
          projects: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const store = useWorkspaceStore.getState();
      store.setTeamBoards(mockBoards);

      const state = useWorkspaceStore.getState();
      expect(state.teamBoards).toEqual(mockBoards);
    });
  });

  describe("Filter actions", () => {
    it("should set filter status", () => {
      const store = useWorkspaceStore.getState();
      store.setFilter({ status: TaskStatus.IN_PROGRESS });

      const state = useWorkspaceStore.getState();
      expect(state.filter.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it("should set filter search", () => {
      const store = useWorkspaceStore.getState();
      store.setFilter({ search: "test query" });

      const state = useWorkspaceStore.getState();
      expect(state.filter.search).toBe("test query");
    });

    it("should merge filter updates", () => {
      const store = useWorkspaceStore.getState();
      store.setFilter({ status: TaskStatus.IN_PROGRESS });
      store.setFilter({ search: "test query" });

      const state = useWorkspaceStore.getState();
      expect(state.filter.status).toBe(TaskStatus.IN_PROGRESS);
      expect(state.filter.search).toBe("test query");
    });
  });

  describe("Reset actions", () => {
    it("should reset board state", () => {
      const mockProject: Project = {
        _id: "project-1",
        title: "Project 1",
        description: "Description 1",
        board: "board-1",
        owner: "user-1",
        orderInBoard: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      useWorkspaceStore.setState({
        projects: [mockProject],
        currentBoardId: "board-1",
        filter: { status: TaskStatus.DONE, search: "test" }
      });

      const store = useWorkspaceStore.getState();
      store.resetInBoards();

      const state = useWorkspaceStore.getState();
      expect(state.projects).toEqual([]);
      expect(state.currentBoardId).toBeNull();
      expect(state.filter).toEqual({ status: null, search: "" });
    });
  });
});
