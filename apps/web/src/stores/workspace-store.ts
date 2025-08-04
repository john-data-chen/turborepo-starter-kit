import { boardApi } from '@/lib/api/boardApi';
import { taskApi } from '@/lib/api/taskApi';
import { Board, Project, Task } from '@/types/dbInterface';
import { TaskStatus } from '@/types/dbInterface';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUpdateBoard } from '../lib/api/boards/queries';
import { projectApi } from '../lib/api/projectApi';
import {
  useCreateProject,
  useDeleteProject,
  useUpdateProject
} from '../lib/api/projects/queries';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask
} from '../lib/api/tasks/queries';

interface State {
  // User state
  userId: string | null;
  userEmail: string | null;
  setUserInfo: (email: string, userId: string) => void;

  // Projects state
  projects: Project[];
  isLoadingProjects: boolean;
  setProjects: (projects: Project[]) => void;

  // Boards state
  currentBoardId: string | null;
  myBoards: Board[];
  teamBoards: Board[];

  // Filter state
  filter: {
    status: string | null;
    search: string;
  };

  // Actions
  fetchProjects: (boardId: string) => Promise<void>;
  fetchTasksByProject: (projectId: string) => Promise<Task[]>;
  addProject: (title: string, description: string) => Promise<string>;
  updateProject: (
    id: string,
    newTitle: string,
    newDescription?: string
  ) => Promise<void>;
  removeProject: (id: string) => Promise<void>;

  // Task actions
  addTask: (
    projectId: string,
    title: string,
    status: TaskStatus,
    description?: string,
    dueDate?: Date,
    assigneeId?: string
  ) => Promise<void>;

  updateTask: (
    taskId: string,
    title: string,
    status: TaskStatus,
    description?: string,
    dueDate?: Date,
    assigneeId?: string,
    newProjectId?: string
  ) => Promise<void>;

  removeTask: (taskId: string) => Promise<void>;
  dragTaskOnProject: (taskId: string, newProjectId: string) => Promise<void>;

  // Board actions
  setCurrentBoardId: (boardId: string) => void;
  addBoard: (title: string, description?: string) => Promise<string>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  removeBoard: (
    id: string,
    deleteFn: (id: string) => Promise<void>
  ) => Promise<void>;

  // UI state
  setFilter: (filter: Partial<State['filter']>) => void;
  setMyBoards: (boards: Board[]) => void;
  setTeamBoards: (boards: Board[]) => void;
  resetInBoards: () => void;
}

// Custom hook to access the store's state and actions
export const useWorkspaceStore = create<State>()(
  persist(
    (set, get) => ({
      // Initial state
      userEmail: null,
      userId: null,
      projects: [],
      isLoadingProjects: false,
      currentBoardId: null,
      myBoards: [],
      teamBoards: [],
      filter: {
        status: null,
        search: ''
      },

      // User actions
      setUserInfo: (email: string, userId: string) => {
        if (!email || !userId) {
          console.error('Invalid user info provided:', { email, userId });
          throw new Error('Email and userId are required');
        }

        console.log('Setting user info in workspace store:', { email, userId });

        set((state) => {
          // Only update if the values have changed
          if (state.userEmail === email && state.userId === userId) {
            console.log('User info unchanged, skipping update');
            return state;
          }

          console.log('Updating workspace store with new user info');
          return {
            ...state,
            userEmail: email,
            userId: userId
          };
        });
      },

      // Project actions
      fetchProjects: async (boardId: string) => {
        if (!boardId) return;

        set({ isLoadingProjects: true });

        try {
          const projects = await projectApi.getProjects(boardId);

          if (projects) {
            set({
              projects: projects.map((project) => ({
                ...project,
                tasks: [] // Tasks will be loaded separately if needed
              }))
            });
          } else {
            set({ projects: [] });
          }
        } catch (error) {
          console.error('Error fetching projects:', error);
          set({ projects: [] });
        } finally {
          set({ isLoadingProjects: false });
        }
      },

      // Fetch tasks for a specific project
      fetchTasksByProject: async (projectId: string) => {
        if (!projectId) {
          console.log('No project ID provided to fetchTasksByProject');
          return [];
        }

        console.log('Fetching tasks for project:', projectId);

        try {
          // Ensure we're using the correct parameter name that matches the backend
          const tasks = await taskApi.getTasks(projectId);
          console.log('Fetched tasks for project', projectId, ':', tasks);

          if (!Array.isArray(tasks)) {
            console.error('Invalid tasks data received:', tasks);
            return [];
          }

          // Update the tasks for this project in the store
          set((state) => {
            const updatedProjects = state.projects.map((project) =>
              project._id === projectId ? { ...project, tasks } : project
            );
            return { projects: updatedProjects };
          });

          return tasks;
        } catch (error) {
          console.error('Error fetching tasks for project:', error);
          return [];
        }
      },

      setProjects: (projects: Project[]) => set({ projects }),

      addProject: async (title: string, description: string) => {
        try {
          const { currentBoardId } = get();
          if (!currentBoardId) {
            throw new Error('No board selected');
          }

          const createProject = useCreateProject();
          const newProject = await createProject.mutateAsync({
            title,
            description,
            boardId: currentBoardId
          });

          if (newProject) {
            set((state) => ({
              projects: [...state.projects, newProject]
            }));
            return newProject._id;
          }

          throw new Error('Failed to create project');
        } catch (error) {
          console.error('Error in addProject:', error);
          throw error;
        }
      },

      updateProject: async (
        id: string,
        newTitle: string,
        newDescription?: string
      ) => {
        try {
          const updateProject = useUpdateProject();
          await updateProject.mutateAsync({
            id,
            title: newTitle,
            description: newDescription
          });

          // Optimistic update
          set((state) => ({
            projects: state.projects.map((project) =>
              project._id === id
                ? {
                    ...project,
                    title: newTitle,
                    description: newDescription || project.description
                  }
                : project
            )
          }));
        } catch (error) {
          console.error('Error updating project:', error);
          throw error;
        }
      },

      removeProject: async (id: string) => {
        try {
          const deleteProject = useDeleteProject();
          await deleteProject.mutateAsync(id);

          // Optimistic update
          set((state) => ({
            projects: state.projects.filter((project) => project._id !== id)
          }));
        } catch (error) {
          console.error('Error removing project:', error);
          throw error;
        }
      },

      // Task actions
      addTask: async (
        projectId: string,
        title: string,
        status: TaskStatus = TaskStatus.TODO,
        description?: string,
        dueDate?: Date,
        assigneeId?: string
      ) => {
        try {
          const { currentBoardId, userId } = get();
          if (!currentBoardId) {
            throw new Error('No board selected');
          }
          if (!userId) {
            throw new Error('User not authenticated');
          }

          const createTask = useCreateTask();
          const taskInput: any = {
            title,
            description,
            status,
            projectId,
            boardId: currentBoardId,
            creatorId: userId
          };

          if (dueDate) {
            taskInput.dueDate = dueDate;
          }

          if (assigneeId) {
            taskInput.assigneeId = assigneeId;
          }

          await createTask.mutateAsync(taskInput);

          // Invalidate and refetch projects to get the new task
          const { fetchProjects } = get();
          await fetchProjects(currentBoardId);
        } catch (error) {
          console.error('Error adding task:', error);
          throw error;
        }
      },

      updateTask: async (
        taskId: string,
        title: string,
        status: TaskStatus = TaskStatus.TODO,
        description?: string,
        dueDate?: Date,
        assigneeId?: string,
        newProjectId?: string
      ) => {
        try {
          const { userId, currentBoardId } = get();
          if (!userId) {
            throw new Error('User not authenticated');
          }

          const updateTask = useUpdateTask();
          const updateData: any = {
            id: taskId,
            title,
            description,
            status,
            lastModifierId: userId
          };

          if (dueDate) {
            updateData.dueDate = dueDate;
          }

          if (assigneeId) {
            updateData.assigneeId = assigneeId;
          }

          if (newProjectId) {
            updateData.projectId = newProjectId;
          }

          await updateTask.mutateAsync(updateData);

          // Invalidate and refetch projects to get the updated task
          if (currentBoardId) {
            const { fetchProjects } = get();
            await fetchProjects(currentBoardId);
          }
        } catch (error) {
          console.error('Error updating task:', error);
          throw error;
        }
      },

      removeTask: async (taskId: string) => {
        try {
          const { currentBoardId } = get();
          const deleteTask = useDeleteTask();
          await deleteTask.mutateAsync(taskId);

          // Invalidate and refetch projects to reflect the deleted task
          if (currentBoardId) {
            const { fetchProjects } = get();
            await fetchProjects(currentBoardId);
          }
        } catch (error) {
          console.error('Error removing task:', error);
          throw error;
        }
      },

      dragTaskOnProject: async (taskId: string, newProjectId: string) => {
        try {
          const { updateTask, currentBoardId } = get();

          // First, find the task to get its current data
          const { data: tasks } = useTasks();
          const taskToMove = tasks?.find((t: any) => t._id === taskId);

          if (!taskToMove) {
            throw new Error('Task not found');
          }

          // Update the task's project
          await updateTask(
            taskId,
            taskToMove.title,
            taskToMove.status,
            taskToMove.description || undefined,
            taskToMove.dueDate ? new Date(taskToMove.dueDate) : undefined,
            taskToMove.assignee?._id || undefined,
            newProjectId
          );

          // Invalidate and refetch projects to update the UI
          if (currentBoardId) {
            const { fetchProjects } = get();
            await fetchProjects(currentBoardId);
          }
        } catch (error) {
          console.error('Error moving task to project:', error);
          throw error;
        }
      },

      // Board actions
      setCurrentBoardId: (boardId: string) => {
        set({ currentBoardId: boardId });
      },

      addBoard: async (title: string, description?: string) => {
        try {
          const { userId } = get();
          if (!userId) {
            throw new Error('User not authenticated');
          }

          // Call the API to create the board with the current user as owner
          const newBoard = await boardApi.createBoard({
            title,
            description,
            owner: userId // Add the current user's ID as the board owner
          });

          if (newBoard) {
            // Add the new board to the myBoards array
            set((state) => ({
              myBoards: [...state.myBoards, newBoard]
            }));

            return newBoard._id;
          }

          throw new Error('Failed to create board');
        } catch (error) {
          console.error('Error in addBoard:', error);
          throw error;
        }
      },

      updateBoard: async (id: string, data: Partial<Board>) => {
        try {
          const updateBoard = useUpdateBoard();
          await updateBoard.mutateAsync({ id, ...data });

          // Optimistic update
          set((state) => ({
            myBoards: state.myBoards.map((board) =>
              board._id === id ? { ...board, ...data } : board
            ),
            teamBoards: state.teamBoards.map((board) =>
              board._id === id ? { ...board, ...data } : board
            )
          }));
        } catch (error) {
          console.error('Error updating board:', error);
          throw error;
        }
      },

      removeBoard: async (
        id: string,
        deleteFn: (id: string) => Promise<void>
      ) => {
        try {
          await deleteFn(id);

          // Update state to remove the deleted board
          set((state) => ({
            myBoards: state.myBoards.filter((board) => board._id !== id),
            teamBoards: state.teamBoards.filter((board) => board._id !== id),
            // Reset current board if it's the one being deleted
            currentBoardId:
              state.currentBoardId === id ? null : state.currentBoardId
          }));
        } catch (error) {
          console.error('Error removing board:', error);
          throw error;
        }
      },

      // UI state
      setFilter: (filter) =>
        set((state) => ({
          filter: { ...state.filter, ...filter }
        })),

      setMyBoards: (boards) => set({ myBoards: boards }),

      setTeamBoards: (boards) => set({ teamBoards: boards }),

      resetInBoards: () =>
        set({
          projects: [],
          currentBoardId: null,
          filter: { status: null, search: '' }
        })
    }),
    {
      name: 'workspace-store',
      partialize: (state) => ({
        // Only persist these parts of the state
        currentBoardId: state.currentBoardId,
        myBoards: state.myBoards,
        teamBoards: state.teamBoards,
        filter: state.filter
      })
    }
  )
);
