import { beforeEach, describe, expect, it, vi } from "vitest";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { TaskStatus, type Project, type Task } from "@/types/dbInterface";

// Mock the API modules
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

describe("workspace-store - Task actions", () => {
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

  describe("Task actions", () => {
    it("should fetch tasks by project", async () => {
      const { taskApi } = await import("@/lib/api/taskApi");
      const mockTasks: Task[] = [
        {
          _id: "task-1",
          title: "Task 1",
          description: "Description 1",
          status: TaskStatus.TODO,
          project: "project-1",
          board: "board-1",
          creator: "user-1",
          lastModifier: "user-1",
          orderInProject: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

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
        projects: [mockProject]
      });

      vi.mocked(taskApi.getTasks).mockResolvedValue(mockTasks);

      const store = useWorkspaceStore.getState();
      const tasks = await store.fetchTasksByProject("project-1");

      expect(tasks).toHaveLength(1);
      expect(tasks[0]._id).toBe("task-1");

      const state = useWorkspaceStore.getState();
      expect(state.projects[0].tasks).toEqual(mockTasks);
    });

    it("should return empty array when fetching tasks fails", async () => {
      const { taskApi } = await import("@/lib/api/taskApi");
      vi.mocked(taskApi.getTasks).mockRejectedValue(new Error("Failed to fetch"));

      const store = useWorkspaceStore.getState();
      const tasks = await store.fetchTasksByProject("project-1");

      expect(tasks).toEqual([]);
    });

    it("should return empty array when projectId is empty", async () => {
      const store = useWorkspaceStore.getState();
      const tasks = await store.fetchTasksByProject("");

      expect(tasks).toEqual([]);
    });

    it("should return empty array when getTasks does not return an array", async () => {
      const { taskApi } = await import("@/lib/api/taskApi");
      vi.mocked(taskApi.getTasks).mockResolvedValue(null as any);

      const store = useWorkspaceStore.getState();
      const tasks = await store.fetchTasksByProject("project-1");

      expect(tasks).toEqual([]);
    });

    it("should add a new task", async () => {
      const { projectApi } = await import("@/lib/api/projectApi");
      const mockTask: Task = {
        _id: "task-new",
        title: "New Task",
        description: "New Description",
        status: TaskStatus.TODO,
        project: "project-1",
        board: "board-1",
        creator: "user-1",
        lastModifier: "user-1",
        orderInProject: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

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
        userId: "user-1",
        currentBoardId: "board-1",
        projects: [mockProject]
      });

      const createTaskMock = vi.fn().mockResolvedValue(mockTask);
      vi.mocked(projectApi.getProjects).mockResolvedValue([{ ...mockProject, tasks: [mockTask] }]);

      const store = useWorkspaceStore.getState();
      await store.addTask(
        "project-1",
        "New Task",
        TaskStatus.TODO,
        createTaskMock,
        "New Description"
      );

      expect(createTaskMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          description: "New Description",
          status: TaskStatus.TODO,
          project: "project-1",
          board: "board-1",
          creator: "user-1"
        })
      );
    });

    it("should throw error when adding task without user authenticated", async () => {
      useWorkspaceStore.setState({
        userId: null,
        currentBoardId: "board-1"
      });

      const createTaskMock = vi.fn();
      const store = useWorkspaceStore.getState();

      await expect(
        store.addTask("project-1", "New Task", TaskStatus.TODO, createTaskMock)
      ).rejects.toMatchObject({
        message: expect.stringContaining("User not authenticated or no board selected")
      });
    });

    it("should throw error when adding task without board selected", async () => {
      useWorkspaceStore.setState({
        userId: "user-1",
        currentBoardId: null
      });

      const createTaskMock = vi.fn();
      const store = useWorkspaceStore.getState();

      await expect(
        store.addTask("project-1", "New Task", TaskStatus.TODO, createTaskMock)
      ).rejects.toMatchObject({
        message: expect.stringContaining("User not authenticated or no board selected")
      });
    });

    it("should update a task", async () => {
      const { taskApi } = await import("@/lib/api/taskApi");
      const { projectApi } = await import("@/lib/api/projectApi");

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
        userId: "user-1",
        currentBoardId: "board-1",
        projects: [mockProject]
      });

      vi.mocked(taskApi.updateTask).mockResolvedValue(undefined as any);
      vi.mocked(projectApi.getProjects).mockResolvedValue([mockProject]);

      const store = useWorkspaceStore.getState();
      await store.updateTask(
        "task-1",
        "Updated Title",
        TaskStatus.IN_PROGRESS,
        "Updated Description"
      );

      expect(taskApi.updateTask).toHaveBeenCalledWith(
        "task-1",
        expect.objectContaining({
          title: "Updated Title",
          status: TaskStatus.IN_PROGRESS,
          description: "Updated Description",
          lastModifier: "user-1"
        })
      );
    });

    it("should throw error when updating task without user authenticated", async () => {
      useWorkspaceStore.setState({
        userId: null,
        currentBoardId: "board-1"
      });

      const store = useWorkspaceStore.getState();

      await expect(store.updateTask("task-1", "Title", TaskStatus.TODO)).rejects.toMatchObject({
        message: expect.stringContaining("User not authenticated")
      });
    });

    it("should remove a task", async () => {
      const { useDeleteTask } = await import("@/lib/api/tasks");
      const { projectApi } = await import("@/lib/api/projectApi");

      const mockTask: Task = {
        _id: "task-1",
        title: "Task 1",
        description: "Description 1",
        status: TaskStatus.TODO,
        project: "project-1",
        board: "board-1",
        creator: "user-1",
        lastModifier: "user-1",
        orderInProject: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockProject: Project = {
        _id: "project-1",
        title: "Project 1",
        description: "Description 1",
        board: "board-1",
        owner: "user-1",
        orderInBoard: 0,
        tasks: [mockTask],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      useWorkspaceStore.setState({
        currentBoardId: "board-1",
        projects: [mockProject]
      });

      const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useDeleteTask).mockReturnValue({ mutateAsync: mockMutateAsync } as any);
      vi.mocked(projectApi.getProjects).mockResolvedValue([{ ...mockProject, tasks: [] }]);

      const store = useWorkspaceStore.getState();
      await store.removeTask("task-1");

      expect(mockMutateAsync).toHaveBeenCalledWith("task-1", expect.any(Object));
      const state = useWorkspaceStore.getState();
      expect(state.projects[0].tasks).toHaveLength(0);
    });

    it("should drag task to another project", async () => {
      const { taskApi } = await import("@/lib/api/taskApi");
      const { projectApi } = await import("@/lib/api/projectApi");

      const mockTask: Task = {
        _id: "task-1",
        title: "Task 1",
        description: "Description 1",
        status: TaskStatus.TODO,
        project: "project-1",
        board: "board-1",
        creator: "user-1",
        lastModifier: "user-1",
        orderInProject: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      useWorkspaceStore.setState({
        userId: "user-1",
        currentBoardId: "board-1",
        projects: []
      });

      const getTaskMock = vi.fn().mockResolvedValue(mockTask);
      vi.mocked(taskApi.updateTask).mockResolvedValue(undefined as any);
      vi.mocked(projectApi.getProjects).mockResolvedValue([]);

      const store = useWorkspaceStore.getState();
      await store.dragTaskOnProject("task-1", "project-2", getTaskMock);

      expect(getTaskMock).toHaveBeenCalledWith("task-1");
      expect(taskApi.updateTask).toHaveBeenCalledWith(
        "task-1",
        expect.objectContaining({
          projectId: "project-2"
        })
      );
    });

    it("should throw error when dragging task that does not exist", async () => {
      useWorkspaceStore.setState({
        currentBoardId: "board-1"
      });

      const getTaskMock = vi.fn().mockResolvedValue(undefined);
      const store = useWorkspaceStore.getState();

      await expect(
        store.dragTaskOnProject("task-1", "project-2", getTaskMock)
      ).rejects.toMatchObject({
        message: expect.stringContaining("Task not found")
      });
    });
  });
});
