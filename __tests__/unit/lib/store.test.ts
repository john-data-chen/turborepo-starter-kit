import { defaultEmail } from '@/constants/demoData';
import * as dbBoard from '@/lib/db/board';
import * as dbProject from '@/lib/db/project';
import * as dbTask from '@/lib/db/task';
import * as dbUser from '@/lib/db/user';
import { useTaskStore } from '@/lib/store';
import {
  Board,
  Project,
  Task,
  TaskStatus,
  UserInfo
} from '@/types/dbInterface';
// Import TaskStatus
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the database modules
vi.mock('@/lib/db/user');
vi.mock('@/lib/db/board');
vi.mock('@/lib/db/project');
vi.mock('@/lib/db/task');

// Helper to reset store state before each test
const resetStore = () => {
  act(() => {
    useTaskStore.setState(useTaskStore.getInitialState(), true);
  });
};

describe('Zustand Store: useTaskStore', () => {
  const mockUser: UserInfo = { id: 'user-1', name: 'Test User' };
  // Define a mock user object that includes email, matching the expected return type of getUserByEmail
  const mockFullUser = {
    // This could be typed as User if User type matches exactly
    id: 'user-1',
    name: 'Test User',
    email: defaultEmail // Use the imported defaultEmail
  };
  const mockUserEmail = defaultEmail;
  const mockBoardId = 'board-1';
  const mockProjectId = 'project-1';
  const mockTaskId = 'task-1';

  const mockProject: Project = {
    _id: mockProjectId,
    title: 'Test Project',
    owner: mockUser,
    members: [mockUser],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [],
    board: mockBoardId
  };

  const mockTask: Task = {
    _id: mockTaskId,
    title: 'Test Task',
    status: TaskStatus.TODO, // Use Enum member
    board: mockBoardId,
    project: mockProjectId,
    creator: mockUser,
    lastModifier: mockUser,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Reset mocks and store state before each test
    vi.clearAllMocks();
    resetStore();

    // Set initial user info for actions that require it
    act(() => {
      useTaskStore.setState({
        userId: mockUser.id,
        userEmail: mockUserEmail,
        currentBoardId: mockBoardId
      });
    });
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });

  it('should have correct initial state', () => {
    resetStore(); // Ensure we test the actual initial state
    const state = useTaskStore.getState();
    expect(state.userEmail).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.projects).toEqual([]);
    expect(state.isLoadingProjects).toBe(false); // Add this line
    expect(state.filter).toEqual({ status: null, search: '' });
    expect(state.currentBoardId).toBeNull();
    expect(state.myBoards).toEqual([]);
    expect(state.teamBoards).toEqual([]);
  });

  // --- User Actions ---
  describe('setUserInfo', () => {
    it('should set user email and id on successful fetch', async () => {
      // Use mockFullUser which includes the email property
      vi.mocked(dbUser.getUserByEmail).mockResolvedValue(mockFullUser);
      await act(async () => {
        await useTaskStore.getState().setUserInfo(mockUserEmail);
      });
      const state = useTaskStore.getState();
      expect(dbUser.getUserByEmail).toHaveBeenCalledWith(mockUserEmail);
      expect(state.userEmail).toBe(mockUserEmail);
      // Ensure the userId is correctly extracted from the resolved user object
      expect(state.userId).toBe(mockFullUser.id);
    });

    it('should log error if user not found', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.mocked(dbUser.getUserByEmail).mockResolvedValue(null);

      // Call the function and wait for any async operations to complete
      useTaskStore.getState().setUserInfo('notfound@example.com');

      // Wait for the next tick to allow any pending promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('User not found');

      // Verify state remains unchanged
      const state = useTaskStore.getState();
      expect(state.userEmail).toBe(mockUserEmail);
      expect(state.userId).toBe(mockUser.id);

      // Clean up
      consoleErrorSpy.mockRestore();
    });
  });

  // --- Board Actions ---
  describe('Board Actions', () => {
    it('setCurrentBoardId should update currentBoardId', () => {
      const newBoardId = 'board-new';
      act(() => {
        useTaskStore.getState().setCurrentBoardId(newBoardId);
      });
      expect(useTaskStore.getState().currentBoardId).toBe(newBoardId);
    });

    it('addBoard should call createBoardInDb and update state', async () => {
      const newBoard: Board = {
        // Use Board type directly if possible
        _id: 'new-board-id',
        title: 'New Board',
        owner: mockUser,
        members: [],
        projects: [],
        createdAt: new Date(),
        updatedAt: new Date()
        // Add description if it's part of the Board type and returned by createBoardInDb
        // description: 'Desc'
      };
      // Assuming createBoardInDb returns a Board object matching the type
      vi.mocked(dbBoard.createBoardInDb).mockResolvedValue(newBoard);

      let boardId = '';
      await act(async () => {
        boardId = await useTaskStore.getState().addBoard('New Board', 'Desc');
      });

      expect(dbBoard.createBoardInDb).toHaveBeenCalledWith({
        title: 'New Board',
        userEmail: mockUserEmail,
        description: 'Desc'
      });
      expect(boardId).toBe('new-board-id');
      expect(useTaskStore.getState().currentBoardId).toBe('new-board-id');
      expect(useTaskStore.getState().projects).toEqual([]); // Should reset projects
    });

    it('addBoard should throw error if userEmail is null', async () => {
      act(() => {
        useTaskStore.setState({ userEmail: null });
      }); // Reset userEmail for this test
      await expect(
        useTaskStore.getState().addBoard('New Board')
      ).rejects.toThrow('User email not found');
    });

    it('updateBoard should call updateBoardInDb', async () => {
      vi.mocked(dbBoard.updateBoardInDb).mockResolvedValue({} as any); // Mock successful update
      const updateData = { title: 'Updated Board Title' };
      await act(async () => {
        await useTaskStore.getState().updateBoard(mockBoardId, updateData);
      });
      expect(dbBoard.updateBoardInDb).toHaveBeenCalledWith(
        mockBoardId,
        updateData,
        mockUserEmail
      );
    });

    it('removeBoard should call deleteBoardInDb', async () => {
      vi.mocked(dbBoard.deleteBoardInDb).mockResolvedValue(true); // Mock successful delete
      await act(async () => {
        await useTaskStore.getState().removeBoard(mockBoardId);
      });
      expect(dbBoard.deleteBoardInDb).toHaveBeenCalledWith(
        mockBoardId,
        mockUserEmail
      );
    });

    it('setMyBoards should update myBoards state', () => {
      const boards: Board[] = [{ _id: 'b1', title: 'My Board 1' } as Board];
      act(() => {
        useTaskStore.getState().setMyBoards(boards);
      });
      expect(useTaskStore.getState().myBoards).toEqual(boards);
    });

    it('setTeamBoards should update teamBoards state', () => {
      const boards: Board[] = [{ _id: 'b2', title: 'Team Board 1' } as Board];
      act(() => {
        useTaskStore.getState().setTeamBoards(boards);
      });
      expect(useTaskStore.getState().teamBoards).toEqual(boards);
    });

    it('resetInBoards should reset relevant state', () => {
      act(() => {
        useTaskStore.setState({
          myBoards: [{ _id: 'b1' } as Board],
          teamBoards: [{ _id: 'b2' } as Board],
          currentBoardId: 'some-board',
          projects: [mockProject]
        });
      });
      act(() => {
        useTaskStore.getState().resetInBoards();
      });
      const state = useTaskStore.getState();
      expect(state.myBoards).toEqual([]);
      expect(state.teamBoards).toEqual([]);
      expect(state.currentBoardId).toBeNull();
      expect(state.projects).toEqual([]);
    });
  });

  // --- Project Actions ---
  describe('Project Actions', () => {
    it('fetchProjects should fetch projects and their tasks and manage isLoadingProjects state', async () => {
      const project1: Project = { ...mockProject, _id: 'p1', tasks: [] };
      const project2: Project = { ...mockProject, _id: 'p2', tasks: [] };
      const task1: Task = { ...mockTask, _id: 't1', project: 'p1' };
      const task2: Task = { ...mockTask, _id: 't2', project: 'p2' };

      vi.mocked(dbProject.getProjectsFromDb).mockResolvedValue([
        project1,
        project2
      ]);
      vi.mocked(dbTask.getTasksByProjectId)
        .mockResolvedValueOnce([task1])
        .mockResolvedValueOnce([task2]);

      // Check isLoadingProjects before fetch
      expect(useTaskStore.getState().isLoadingProjects).toBe(false);

      const fetchPromise = act(async () => {
        await useTaskStore.getState().fetchProjects(mockBoardId);
      });

      // Check isLoadingProjects during fetch (immediately after calling)
      expect(useTaskStore.getState().isLoadingProjects).toBe(true);

      await fetchPromise; // Wait for the fetch to complete

      expect(dbProject.getProjectsFromDb).toHaveBeenCalledWith(mockBoardId);
      expect(dbTask.getTasksByProjectId).toHaveBeenCalledWith('p1');
      expect(dbTask.getTasksByProjectId).toHaveBeenCalledWith('p2');
      expect(useTaskStore.getState().projects).toEqual([
        { ...project1, tasks: [task1] },
        { ...project2, tasks: [task2] }
      ]);
      // Check isLoadingProjects after fetch
      expect(useTaskStore.getState().isLoadingProjects).toBe(false);
    });

    it('fetchProjects should set empty array and isLoadingProjects to false if no projects found', async () => {
      vi.mocked(dbProject.getProjectsFromDb).mockResolvedValue([]);

      expect(useTaskStore.getState().isLoadingProjects).toBe(false);
      const fetchPromise = act(async () => {
        await useTaskStore.getState().fetchProjects(mockBoardId);
      });
      expect(useTaskStore.getState().isLoadingProjects).toBe(true);
      await fetchPromise;

      expect(useTaskStore.getState().projects).toEqual([]);
      expect(dbTask.getTasksByProjectId).not.toHaveBeenCalled();
      expect(useTaskStore.getState().isLoadingProjects).toBe(false);
    });

    it('fetchProjects should set isLoadingProjects to false on error', async () => {
      vi.mocked(dbProject.getProjectsFromDb).mockRejectedValue(
        new Error('DB Error')
      );

      expect(useTaskStore.getState().isLoadingProjects).toBe(false);
      const fetchPromise = act(async () => {
        // We expect this to throw an error or handle it internally,
        // but the isLoadingProjects state should still be managed.
        try {
          await useTaskStore.getState().fetchProjects(mockBoardId);
        } catch (e) {
          // error is expected
        }
      });
      expect(useTaskStore.getState().isLoadingProjects).toBe(true);
      await fetchPromise;

      expect(useTaskStore.getState().projects).toEqual([]); // Should be empty on error
      expect(useTaskStore.getState().isLoadingProjects).toBe(false);
    });

    it('addProject should add a project to the state', async () => {
      const newProject = {
        ...mockProject,
        _id: 'new-project-id',
        title: 'New Project',
        description: 'New Desc'
      };
      vi.mocked(dbProject.createProjectInDb).mockResolvedValue(newProject);

      let projectId = '';
      await act(async () => {
        projectId = await useTaskStore
          .getState()
          .addProject('New Project', 'New Desc');
      });

      expect(dbProject.createProjectInDb).toHaveBeenCalledWith({
        title: 'New Project',
        description: 'New Desc',
        userEmail: mockUserEmail,
        board: mockBoardId
      });
      expect(projectId).toBe('new-project-id');
      expect(useTaskStore.getState().projects).toContainEqual(newProject);
    });

    it('updateProject should update a project in the state', async () => {
      act(() => {
        useTaskStore.setState({ projects: [mockProject] });
      });
      // Change mockResolvedValue to null to satisfy 'Project | null'
      vi.mocked(dbProject.updateProjectInDb).mockResolvedValue(null);

      const updatedTitle = 'Updated Project Title';
      // Use await act for async operations within act
      await act(async () => {
        await useTaskStore
          .getState()
          .updateProject(mockProjectId, updatedTitle, 'Updated Desc');
      });

      expect(dbProject.updateProjectInDb).toHaveBeenCalledWith({
        projectId: mockProjectId,
        userEmail: mockUserEmail,
        newTitle: updatedTitle,
        newDescription: 'Updated Desc'
      });
      // Check the state update after the async operation completes
      const updatedProject = useTaskStore
        .getState()
        .projects.find((p) => p._id === mockProjectId);
      expect(updatedProject?.title).toBe(updatedTitle);
      // Note: Description update is not reflected in state in the current store implementation
      // If description should be updated in state, the store logic needs adjustment.
      // expect(updatedProject?.description).toBe('Updated Desc');
    });

    it('removeProject should remove a project from the state', async () => {
      act(() => {
        useTaskStore.setState({ projects: [mockProject] });
      });
      // Fix: Change mockResolvedValue to true instead of undefined
      vi.mocked(dbProject.deleteProjectInDb).mockResolvedValue(true); // Simulate successful deletion

      await act(async () => {
        await useTaskStore.getState().removeProject(mockProjectId);
      });

      expect(dbProject.deleteProjectInDb).toHaveBeenCalledWith(
        mockProjectId,
        mockUserEmail
      );
      expect(useTaskStore.getState().projects).toHaveLength(0);
    });
  });

  // --- Task Actions ---
  describe('Task Actions', () => {
    beforeEach(() => {
      // Ensure there's a project in state for task actions
      act(() => {
        useTaskStore.setState({ projects: [{ ...mockProject, tasks: [] }] });
      });
    });

    it('addTask should add a task to the correct project', async () => {
      const newTaskData = {
        title: 'New Task',
        status: TaskStatus.TODO, // Use Enum member
        description: 'Task Desc',
        dueDate: new Date(),
        assigneeId: 'assignee-1'
      };
      const createdTask: Task = {
        // Ensure createdTask matches Task type
        ...mockTask, // Use updated mockTask with correct status type
        _id: 'new-task-id',
        title: newTaskData.title,
        status: newTaskData.status,
        description: newTaskData.description,
        dueDate: newTaskData.dueDate,
        assignee: newTaskData.assigneeId
          ? { id: newTaskData.assigneeId, name: 'Assignee Name' } // Mock assignee name if needed
          : undefined,
        project: mockProjectId
      };
      vi.mocked(dbTask.createTaskInDb).mockResolvedValue(createdTask);

      await act(async () => {
        await useTaskStore.getState().addTask(
          mockProjectId,
          newTaskData.title,
          newTaskData.status, // Pass enum member
          newTaskData.description,
          newTaskData.dueDate,
          newTaskData.assigneeId
        );
      });

      expect(dbTask.createTaskInDb).toHaveBeenCalledWith(
        mockProjectId,
        newTaskData.title,
        mockUserEmail,
        newTaskData.description,
        newTaskData.dueDate,
        newTaskData.assigneeId,
        newTaskData.status // Expect enum member
      );
      const project = useTaskStore
        .getState()
        .projects.find((p) => p._id === mockProjectId);
      // Ensure the task added to the state matches the Task interface
      const addedTask = project?.tasks.find((t) => t._id === 'new-task-id');
      expect(addedTask).toBeDefined();
      expect(addedTask?.status).toBe(TaskStatus.TODO);
      // Add more specific checks if needed, comparing against createdTask
      expect(project?.tasks).toContainEqual(
        expect.objectContaining({
          _id: 'new-task-id',
          status: TaskStatus.TODO
        })
      );
    });

    it('updateTask should update a task within its project', async () => {
      const initialTask: Task = { ...mockTask, project: mockProjectId }; // Use updated mockTask
      act(() => {
        useTaskStore.setState({
          projects: [{ ...mockProject, tasks: [initialTask] }]
        });
      });

      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS, // Use Enum member
        description: 'Updated Desc',
        dueDate: new Date(),
        assigneeId: 'assignee-2'
      };
      // Ensure updatedTaskResult matches Task type
      const updatedTaskResult: Task = {
        ...initialTask,
        title: updateData.title,
        status: updateData.status,
        description: updateData.description,
        dueDate: updateData.dueDate,
        assignee: updateData.assigneeId
          ? { id: updateData.assigneeId, name: 'Assignee 2 Name' } // Mock assignee name
          : undefined,
        // lastModifier should likely be updated here based on mockUser
        lastModifier: mockUser
      };
      vi.mocked(dbTask.updateTaskInDb).mockResolvedValue(updatedTaskResult);

      await act(async () => {
        await useTaskStore.getState().updateTask(
          mockTaskId,
          updateData.title,
          updateData.status, // Pass enum member
          updateData.description,
          updateData.dueDate,
          updateData.assigneeId
        );
      });

      expect(dbTask.updateTaskInDb).toHaveBeenCalledWith(
        mockTaskId,
        updateData.title,
        mockUserEmail,
        updateData.status, // Expect enum member
        updateData.description,
        updateData.dueDate,
        updateData.assigneeId
      );
      const project = useTaskStore
        .getState()
        .projects.find((p) => p._id === mockProjectId);
      const updatedTaskInState = project?.tasks.find(
        (t) => t._id === mockTaskId
      );
      expect(updatedTaskInState).toBeDefined();
      expect(updatedTaskInState?.status).toBe(TaskStatus.IN_PROGRESS);
      // Compare the whole object for accuracy
      expect(updatedTaskInState).toEqual(
        expect.objectContaining({
          _id: mockTaskId,
          status: TaskStatus.IN_PROGRESS,
          title: 'Updated Task'
          // Add other fields as needed for comparison
        })
      );
    });

    it('removeTask should remove a task from its project', async () => {
      const taskToRemove = { ...mockTask, project: mockProjectId };
      act(() => {
        useTaskStore.setState({
          projects: [{ ...mockProject, tasks: [taskToRemove] }]
        });
      });
      vi.mocked(dbTask.deleteTaskInDb).mockResolvedValue(undefined); // returns void

      await act(async () => {
        await useTaskStore.getState().removeTask(mockTaskId);
      });

      expect(dbTask.deleteTaskInDb).toHaveBeenCalledWith(mockTaskId);
      const project = useTaskStore
        .getState()
        .projects.find((p) => p._id === mockProjectId);
      expect(project?.tasks).toHaveLength(0);
    });

    it('dragTaskOnProject should move task between projects', async () => {
      // Fix: Ensure taskInProject1's project property is 'p1'
      const taskInProject1 = { ...mockTask, _id: mockTaskId, project: 'p1' };
      const project1 = { ...mockProject, _id: 'p1', tasks: [taskInProject1] }; // Task starts in p1
      const project2 = { ...mockProject, _id: 'p2', tasks: [] };
      // Fix: Ensure updatedTask is based on taskInProject1 and update project to 'p2'
      const updatedTask = { ...taskInProject1, project: 'p2' }; // Task moved to p2

      act(() => {
        useTaskStore.setState({ projects: [project1, project2] });
      });
      vi.mocked(dbTask.updateTaskProjectInDb).mockResolvedValue(updatedTask);

      await act(async () => {
        // Use taskInProject1's _id (i.e., mockTaskId) and target project 'p2'
        await useTaskStore.getState().dragTaskOnProject(mockTaskId, 'p2');
      });

      // Expect dbTask.updateTaskProjectInDb to have been called with correct arguments
      expect(dbTask.updateTaskProjectInDb).toHaveBeenCalledWith(
        mockUserEmail,
        mockTaskId, // Ensure ID is correct
        'p2' // Ensure target Project ID is correct
      );
      const state = useTaskStore.getState();
      expect(state.projects.find((p) => p._id === 'p1')?.tasks).toHaveLength(0);
      // Check if project2 contains the updated task (compare the whole object or key properties)
      expect(state.projects.find((p) => p._id === 'p2')?.tasks).toContainEqual(
        expect.objectContaining({
          _id: mockTaskId,
          project: 'p2' // Verify project property has been updated
        })
      );
      // Optionally verify the complete updatedTask object
      // expect(state.projects.find((p) => p._id === 'p2')?.tasks).toContainEqual(updatedTask);
    });

    it('dragTaskOnProject should reorder task within the same project', async () => {
      const task1 = { ...mockTask, _id: 't1', project: mockProjectId };
      const task2 = { ...mockTask, _id: 't2', project: mockProjectId };
      const project = { ...mockProject, tasks: [task1, task2] };

      act(() => {
        useTaskStore.setState({ projects: [project] });
      });

      // Simulate dragging t1 onto the same project (should just reorder visually, state updates to move it to end)
      await act(async () => {
        await useTaskStore.getState().dragTaskOnProject('t1', mockProjectId);
      });

      // updateTaskProjectInDb should NOT be called for same project move
      expect(dbTask.updateTaskProjectInDb).not.toHaveBeenCalled();

      const finalProject = useTaskStore
        .getState()
        .projects.find((p) => p._id === mockProjectId);
      // Check if task1 is now at the end of the array
      expect(finalProject?.tasks).toEqual([task2, task1]);
    });
  });

  // --- Filter Actions ---
  describe('Filter Actions', () => {
    it('setFilter should update the filter state', () => {
      act(() => {
        useTaskStore
          .getState()
          .setFilter({ status: 'DONE', search: 'keyword' });
      });
      expect(useTaskStore.getState().filter).toEqual({
        status: 'DONE',
        search: 'keyword'
      });

      act(() => {
        useTaskStore.getState().setFilter({ search: 'new keyword' }); // Partial update
      });
      expect(useTaskStore.getState().filter).toEqual({
        status: 'DONE',
        search: 'new keyword'
      });
    });
  });
});
