import {
  createTaskInDb,
  deleteTaskInDb,
  getTasksByProjectId,
  updateTaskInDb,
  updateTaskProjectInDb
} from '@/lib/db/task';
import { Task, TaskStatus, UserInfo } from '@/types/dbInterface';
import { Types } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import Task type

// --- Mocking Setup ---

// Hoist mocks for dependencies used in vi.mock factories
const mockConnect = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockGetUserByEmail = vi.hoisted(() => vi.fn());
const mockGetUserById = vi.hoisted(() => vi.fn());

const mockTaskLean = vi.hoisted(() => vi.fn());
const mockTaskFind = vi.hoisted(() => vi.fn(() => ({ lean: mockTaskLean })));
const mockTaskFindById = vi.hoisted(() => vi.fn());
const mockTaskCreate = vi.hoisted(() => vi.fn());
const mockTaskFindByIdAndUpdate = vi.hoisted(() => vi.fn());
const mockTaskFindByIdAndDelete = vi.hoisted(() => vi.fn());
const mockTaskToObject = vi.hoisted(() => vi.fn()); // Mock toObject for create/update

const mockProjectFindById = vi.hoisted(() => vi.fn());
const mockProjectFindByIdAndUpdate = vi.hoisted(() => vi.fn()); // For ensureUserIsMember

const mockBoardFindById = vi.hoisted(() => vi.fn());
const mockBoardFindByIdAndUpdate = vi.hoisted(() => vi.fn()); // For ensureUserIsMember

// Mock modules
vi.mock('@/lib/db/connect', () => ({ connectToDatabase: mockConnect }));
vi.mock('@/lib/db/user', () => ({
  getUserByEmail: mockGetUserByEmail,
  getUserById: mockGetUserById
}));
vi.mock('@/models/task.model', () => ({
  TaskModel: {
    find: mockTaskFind,
    findById: mockTaskFindById,
    create: mockTaskCreate,
    findByIdAndUpdate: mockTaskFindByIdAndUpdate,
    findByIdAndDelete: mockTaskFindByIdAndDelete
  }
}));
vi.mock('@/models/project.model', () => ({
  ProjectModel: {
    findById: mockProjectFindById,
    findByIdAndUpdate: mockProjectFindByIdAndUpdate // Mock update for ensureUserIsMember
  }
}));
vi.mock('@/models/board.model', () => ({
  BoardModel: {
    findById: mockBoardFindById,
    findByIdAndUpdate: mockBoardFindByIdAndUpdate // Mock update for ensureUserIsMember
  }
}));

// --- Test Suite ---

describe('Database Task Functions', () => {
  // --- Mock Data ---
  const mockUserId = new Types.ObjectId().toString();
  const mockUserEmail = 'test@example.com';
  const mockUserName = 'Test User';
  const mockUserInfo: UserInfo = { id: mockUserId, name: mockUserName };

  const mockAssigneeId = new Types.ObjectId().toString();
  const mockAssigneeName = 'Assignee User';
  const mockAssigneeInfo: UserInfo = {
    id: mockAssigneeId,
    name: mockAssigneeName
  };

  // Add declarations for the missing variables
  const nonMemberAssigneeId = new Types.ObjectId().toString();
  const nonMemberAssigneeName = 'Non Member Assignee';
  const nonMemberAssigneeInfo: UserInfo = {
    id: nonMemberAssigneeId,
    name: nonMemberAssigneeName
  };

  const mockBoardId = new Types.ObjectId().toString();
  const mockProjectId = new Types.ObjectId().toString();
  const mockTaskId = new Types.ObjectId().toString();
  const mockNewProjectId = new Types.ObjectId().toString();

  // Revert to using string IDs in mockRawTask
  const mockRawTask = {
    _id: new Types.ObjectId(mockTaskId), // Keep _id as ObjectId initially if needed by mocks
    title: 'Test Task',
    description: 'Task Description',
    status: TaskStatus.TODO, // Use enum member
    dueDate: new Date(),
    board: mockBoardId, // Use string ID
    project: mockProjectId, // Use string ID
    assignee: mockAssigneeId, // Use string ID
    creator: mockUserId, // Use string ID
    lastModifier: mockUserId, // Use string ID
    createdAt: new Date(),
    updatedAt: new Date(),
    // Ensure toObject returns a plain object, potentially converting _id if it's ObjectId
    toObject: mockTaskToObject
  };

  const mockRawTaskWithoutAssignee = {
    ...mockRawTask,
    assignee: undefined,
    _id: new Types.ObjectId(), // Different ID
    // board, project, creator, lastModifier are strings from the spread
    toObject: mockTaskToObject
  };

  // mockExpectedTask remains the same (uses string IDs)
  const mockExpectedTask: Task = {
    _id: mockTaskId,
    title: 'Test Task',
    description: 'Task Description',
    status: TaskStatus.TODO, // Use enum member
    dueDate: mockRawTask.dueDate,
    board: mockBoardId,
    project: mockProjectId,
    assignee: mockAssigneeInfo,
    creator: mockUserInfo,
    lastModifier: mockUserInfo,
    createdAt: mockRawTask.createdAt,
    updatedAt: mockRawTask.updatedAt
  };

  // mockProject and mockBoard should still use ObjectId internally for simulation
  const mockProject = {
    _id: new Types.ObjectId(mockProjectId),
    title: 'Test Project',
    board: new Types.ObjectId(mockBoardId),
    owner: new Types.ObjectId(mockUserId),
    members: [
      new Types.ObjectId(mockUserId),
      new Types.ObjectId(mockAssigneeId)
    ]
  };

  const mockNewProject = {
    _id: new Types.ObjectId(mockNewProjectId),
    title: 'New Project',
    board: new Types.ObjectId(mockBoardId), // Assuming same board for simplicity
    owner: new Types.ObjectId(), // Different owner
    members: [new Types.ObjectId(mockUserId)] // User is a member
  };

  const mockBoard = {
    _id: new Types.ObjectId(mockBoardId),
    title: 'Test Board',
    owner: new Types.ObjectId(), // Different owner
    members: [
      new Types.ObjectId(mockUserId),
      new Types.ObjectId(mockAssigneeId)
    ]
  };

  // --- Hooks ---
  beforeEach(() => {
    vi.clearAllMocks(); // Clear all mocks before each test

    // Default mock implementations
    mockConnect.mockResolvedValue(undefined);
    mockGetUserByEmail.mockResolvedValue(mockUserInfo);
    mockGetUserById.mockImplementation((id) => {
      if (id === mockUserId) return Promise.resolve(mockUserInfo);
      if (id === mockAssigneeId) return Promise.resolve(mockAssigneeInfo);
      if (id && id === nonMemberAssigneeId)
        return Promise.resolve(nonMemberAssigneeInfo);
      return Promise.resolve(null); // Default to null if not matched
    });
    mockProjectFindById.mockResolvedValue({ ...mockProject }); // Return copy
    mockBoardFindById.mockResolvedValue({ ...mockBoard }); // Return copy

    // --- Simplified mockTaskToObject ---
    mockTaskToObject.mockImplementation(function (this: any) {
      const plainObject: any = {};
      for (const key in this) {
        // Ensure we don't copy the toObject method itself or prototype properties
        if (
          Object.prototype.hasOwnProperty.call(this, key) &&
          key !== 'toObject'
        ) {
          const value = this[key];
          // Convert ObjectId fields to strings
          if (value instanceof Types.ObjectId) {
            plainObject[key] = value.toString();
          } else {
            // Copy other properties directly
            plainObject[key] = value;
          }
        }
      }
      // Explicitly ensure _id is a string if it exists and wasn't converted
      if (plainObject._id && typeof plainObject._id !== 'string') {
        plainObject._id = plainObject._id.toString();
      }
      // Add explicit string conversion for other known ID fields if necessary
      // based on schema and how data is structured before conversion.
      if (plainObject.board && typeof plainObject.board !== 'string') {
        plainObject.board = plainObject.board.toString();
      }
      if (plainObject.project && typeof plainObject.project !== 'string') {
        plainObject.project = plainObject.project.toString();
      }
      if (plainObject.assignee && typeof plainObject.assignee !== 'string') {
        plainObject.assignee = plainObject.assignee.toString();
      }
      if (plainObject.creator && typeof plainObject.creator !== 'string') {
        plainObject.creator = plainObject.creator.toString();
      }
      if (
        plainObject.lastModifier &&
        typeof plainObject.lastModifier !== 'string'
      ) {
        plainObject.lastModifier = plainObject.lastModifier.toString();
      }

      return plainObject; // Return the newly created plain object
    });
    // --- End Simplified mockTaskToObject ---

    // Mocks return data consistent with string IDs (except _id maybe)
    const rawTaskWithObjectId = {
      ...mockRawTask,
      _id: new Types.ObjectId(mockTaskId)
    };
    mockTaskFindById.mockResolvedValue({
      ...rawTaskWithObjectId,
      toObject: mockTaskToObject // Use the simplified mock
    });
    mockTaskFindByIdAndUpdate.mockResolvedValue({
      ...rawTaskWithObjectId,
      toObject: mockTaskToObject // Use the simplified mock
    });
    mockTaskCreate.mockResolvedValue({
      ...rawTaskWithObjectId,
      toObject: mockTaskToObject // Use the simplified mock
    });
    // Mock lean to return plain objects
    mockTaskLean.mockImplementation(async (docsPromise) => {
      const docs = await docsPromise;
      if (Array.isArray(docs)) {
        return docs.map((doc) => mockTaskToObject.call(doc)); // Apply conversion
      }
      return docs ? mockTaskToObject.call(docs) : null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore any spies
  });

  // --- Test Cases ---

  describe('getTasksByProjectId', () => {
    it('should fetch and convert tasks for a project', async () => {
      // Mock lean to return plain objects with string IDs
      const rawTasksForLean = [
        { ...mockRawTask, _id: new Types.ObjectId(mockTaskId) }, // Use ObjectId for _id initially
        { ...mockRawTaskWithoutAssignee, _id: new Types.ObjectId() }
      ];
      // Adjust mockTaskFind to return something that lean can be called on
      mockTaskFind.mockReturnValue({
        lean: vi
          .fn()
          .mockResolvedValue(
            rawTasksForLean.map((t) => mockTaskToObject.call(t))
          ) // Lean returns plain objects
      });

      const tasks = await getTasksByProjectId(mockProjectId);

      expect(mockConnect).toHaveBeenCalledTimes(1); // Corrected expectation
      // Find should be called with string or ObjectId depending on Mongoose version/behavior, let's assume string for consistency
      expect(mockTaskFind).toHaveBeenCalledWith({ project: mockProjectId });
      expect(mockTaskFind().lean).toHaveBeenCalledTimes(1); // Check lean was called
      // Recalculate getUserById calls based on the plain objects returned by lean
      // Task 1: creator, lastModifier, assignee = 3 calls
      // Task 2: creator, lastModifier = 2 calls (assignee is undefined)
      // Total = 5 calls
      expect(mockGetUserById).toHaveBeenCalledTimes(5);
      expect(tasks).toHaveLength(2);
      // Basic check, detailed conversion is implicitly tested
      expect(tasks[0]._id).toBe(mockTaskId); // Expect string ID
      expect(tasks[0].assignee).toEqual(mockAssigneeInfo);
      expect(tasks[1].assignee).toBeUndefined();
      expect(tasks[0].board).toBe(mockBoardId);
      expect(tasks[0].project).toBe(mockProjectId);
    });

    it('should throw error if database connection fails', async () => {
      mockConnect.mockRejectedValueOnce(new Error('DB Connection Error'));
      await expect(getTasksByProjectId(mockProjectId)).rejects.toThrow();
    });

    it('should throw error if TaskModel.find fails', async () => {
      mockTaskFind.mockImplementationOnce(() => {
        throw new Error('Find Error');
      });
      await expect(getTasksByProjectId(mockProjectId)).rejects.toThrow(
        'Find Error'
      );
    });

    it('should throw error if TaskModel.lean fails', async () => {
      mockTaskFind().lean.mockImplementationOnce(() => {
        throw new Error('Lean Error');
      });
      await expect(getTasksByProjectId(mockProjectId)).rejects.toThrow(
        'Lean Error'
      );
    });
  });

  describe('createTaskInDb', () => {
    it('should add assignee to project/board if not already a member', async () => {
      // Override getUserById for this test
      mockGetUserById.mockImplementation((id) => {
        if (id === mockUserId) return Promise.resolve(mockUserInfo);
        if (id === nonMemberAssigneeId)
          return Promise.resolve(nonMemberAssigneeInfo); // This line should now work
        return Promise.resolve(null);
      });
      // Simulate assignee not being in the members list initially
      mockProjectFindById.mockResolvedValueOnce({
        ...mockProject,
        members: [new Types.ObjectId(mockUserId)]
      });
      mockBoardFindById.mockResolvedValueOnce({
        ...mockBoard,
        members: [new Types.ObjectId(mockUserId)]
      });
      // Mock create returns task with non-member assignee
      const createdRawTask = {
        ...mockRawTask,
        assignee: nonMemberAssigneeId,
        _id: new Types.ObjectId(),
        toObject: mockTaskToObject
      };
      mockTaskCreate.mockResolvedValueOnce(createdRawTask);

      await createTaskInDb(
        mockProjectId, // string
        'Task For Non-Member',
        mockUserEmail, // string
        undefined,
        undefined,
        nonMemberAssigneeId // string // This line should now work
      );

      // Expect updates with string IDs
      expect(mockProjectFindByIdAndUpdate).toHaveBeenCalledWith(mockProjectId, {
        $addToSet: { members: nonMemberAssigneeId }
      });
      // Corrected: Ensure board update uses the string ID
      expect(mockBoardFindByIdAndUpdate).toHaveBeenCalledWith(mockBoard._id, {
        // Use string ID
        $addToSet: { members: nonMemberAssigneeId }
      });
    });

    it('should throw error if creator not found', async () => {
      mockGetUserByEmail.mockResolvedValueOnce(null);
      await expect(
        createTaskInDb(mockProjectId, 'Title', mockUserEmail)
      ).rejects.toThrow('Creator not found');
    });

    it('should throw error if project not found (for board lookup)', async () => {
      mockProjectFindById.mockResolvedValueOnce(null); // Project lookup for board fails
      await expect(
        createTaskInDb(mockProjectId, 'Title', mockUserEmail)
      ).rejects.toThrow('Board not found'); // Error comes from getBoardByProjectId
    });

    it('should throw error if board not found (for ensureUserIsMember)', async () => {
      mockBoardFindById.mockResolvedValueOnce(null); // Board lookup fails
      await expect(
        createTaskInDb(
          mockProjectId,
          'Title',
          mockUserEmail,
          undefined,
          undefined,
          mockAssigneeId
        )
      ).rejects.toThrow('Board not found'); // Error comes from ensureUserIsMember
    });
  });

  describe('updateTaskInDb', () => {
    it('should update a task successfully', async () => {
      const updatedRawTask = {
        ...mockRawTask,
        title: 'Updated Title',
        status: TaskStatus.DONE, // Use enum member
        assignee: new Types.ObjectId(mockUserId), // Change assignee
        toObject: mockTaskToObject
      };
      const updatedExpectedTask: Task = {
        ...mockExpectedTask,
        title: 'Updated Title',
        status: TaskStatus.DONE, // Use enum member
        assignee: mockUserInfo // Assignee is now the main user
      };
      mockTaskFindById.mockResolvedValueOnce(mockRawTask); // Original task
      mockTaskFindByIdAndUpdate.mockResolvedValueOnce(updatedRawTask); // Updated task from DB
      mockTaskToObject.mockReturnValueOnce(updatedRawTask); // Mock toObject for conversion

      const updatedTask = await updateTaskInDb(
        mockTaskId,
        'Updated Title',
        mockUserEmail,
        TaskStatus.DONE, // Use enum member
        'Updated Desc',
        new Date(),
        mockUserId // Assign to the modifier user
      );

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockGetUserByEmail).toHaveBeenCalledWith(mockUserEmail);
      expect(mockTaskFindById).toHaveBeenCalledWith(mockTaskId);
      expect(mockBoardFindById).toHaveBeenCalledWith(mockBoard._id); // For ensureUserIsMember
      expect(mockProjectFindById).toHaveBeenCalledWith(mockProjectId); // For ensureUserIsMember
      expect(mockTaskFindByIdAndUpdate).toHaveBeenCalledWith(
        mockTaskId,
        expect.objectContaining({
          title: 'Updated Title',
          description: 'Updated Desc',
          status: TaskStatus.DONE, // Use enum member
          assignee: mockUserId,
          lastModifier: mockUserId
        }),
        { new: true }
      );
      expect(mockGetUserById).toHaveBeenCalledTimes(3); // creator, assignee (now modifier) for conversion
      expect(updatedTask.title).toBe('Updated Title');
      expect(updatedTask.status).toBe(TaskStatus.DONE); // Use enum member for comparison
      expect(updatedTask.assignee).toEqual(mockUserInfo);
      expect(updatedTask.lastModifier).toEqual(mockUserInfo);
    });

    it('should throw error if modifier not found', async () => {
      mockGetUserByEmail.mockResolvedValueOnce(null);
      await expect(
        updateTaskInDb(mockTaskId, 'Title', mockUserEmail)
      ).rejects.toThrow('Modifier not found');
    });

    it('should throw error if task not found initially', async () => {
      mockTaskFindById.mockResolvedValueOnce(null);
      await expect(
        updateTaskInDb(mockTaskId, 'Title', mockUserEmail)
      ).rejects.toThrow('Task not found');
    });

    it('should throw error if task not found after update attempt', async () => {
      mockTaskFindByIdAndUpdate.mockResolvedValueOnce(null); // Simulate update returning null
      await expect(
        updateTaskInDb(mockTaskId, 'Title', mockUserEmail)
      ).rejects.toThrow('Task not found');
    });
  });

  describe('updateTaskProjectInDb', () => {
    it('should update task project successfully by project member who is task creator', async () => {
      // Simulate user being member of target project and creator of task
      mockProjectFindById.mockResolvedValueOnce(mockNewProject); // User is member
      mockTaskFindById.mockResolvedValueOnce(mockRawTask); // User is creator
      const updatedRawTask = {
        ...mockRawTask,
        project: new Types.ObjectId(mockNewProjectId),
        toObject: mockTaskToObject
      };
      mockTaskFindByIdAndUpdate.mockResolvedValueOnce(updatedRawTask);
      mockTaskToObject.mockReturnValueOnce(updatedRawTask);

      const updatedTask = await updateTaskProjectInDb(
        mockUserEmail,
        mockTaskId,
        mockNewProjectId
      );

      expect(mockTaskFindByIdAndUpdate).toHaveBeenCalled();
      expect(updatedTask.project).toBe(mockNewProjectId);
    });

    it('should update task project successfully by project member who is task assignee', async () => {
      // Simulate user being member of target project and assignee of task
      const assigneeUserEmail = 'assignee@example.com';
      const assigneeUserId = mockAssigneeId;
      mockGetUserByEmail.mockResolvedValueOnce({
        id: assigneeUserId,
        name: mockAssigneeName
      }); // User is assignee
      mockProjectFindById.mockResolvedValueOnce({
        ...mockNewProject,
        members: [new Types.ObjectId(assigneeUserId)]
      }); // Assignee is member
      mockTaskFindById.mockResolvedValueOnce({
        ...mockRawTask,
        creator: new Types.ObjectId()
      }); // Different creator
      const updatedRawTask = {
        ...mockRawTask,
        project: new Types.ObjectId(mockNewProjectId),
        lastModifier: new Types.ObjectId(assigneeUserId),
        toObject: mockTaskToObject
      };
      mockTaskFindByIdAndUpdate.mockResolvedValueOnce(updatedRawTask);
      mockTaskToObject.mockReturnValueOnce(updatedRawTask);

      const updatedTask = await updateTaskProjectInDb(
        assigneeUserEmail,
        mockTaskId,
        mockNewProjectId
      );

      expect(mockTaskFindByIdAndUpdate).toHaveBeenCalledWith(
        mockTaskId,
        expect.objectContaining({ lastModifier: assigneeUserId }),
        { new: true }
      );
      expect(updatedTask.project).toBe(mockNewProjectId);
      expect(updatedTask.lastModifier.id).toBe(assigneeUserId);
    });

    it('should throw permission error if user is not owner or member of target project', async () => {
      // Simulate user not being owner or member
      mockProjectFindById.mockResolvedValueOnce({
        ...mockNewProject,
        owner: new Types.ObjectId(),
        members: []
      });
      mockTaskFindById.mockResolvedValueOnce(mockRawTask);

      await expect(
        updateTaskProjectInDb(mockUserEmail, mockTaskId, mockNewProjectId)
      ).rejects.toThrow('Permission denied');
      expect(mockTaskFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw permission error if user is member but not creator/assignee', async () => {
      // Simulate user being member, but not creator or assignee
      mockProjectFindById.mockResolvedValueOnce(mockNewProject); // User is member
      mockTaskFindById.mockResolvedValueOnce({
        ...mockRawTask,
        creator: new Types.ObjectId(),
        assignee: new Types.ObjectId()
      }); // Different creator/assignee

      await expect(
        updateTaskProjectInDb(mockUserEmail, mockTaskId, mockNewProjectId)
      ).rejects.toThrow('Permission denied');
      expect(mockTaskFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockGetUserByEmail.mockResolvedValueOnce(null);
      await expect(
        updateTaskProjectInDb(mockUserEmail, mockTaskId, mockNewProjectId)
      ).rejects.toThrow('User not found');
    });

    it('should throw error if target project not found', async () => {
      mockProjectFindById.mockResolvedValueOnce(null);
      await expect(
        updateTaskProjectInDb(mockUserEmail, mockTaskId, mockNewProjectId)
      ).rejects.toThrow('Target project not found');
    });

    it('should throw error if task not found', async () => {
      mockTaskFindById.mockResolvedValueOnce(null);
      await expect(
        updateTaskProjectInDb(mockUserEmail, mockTaskId, mockNewProjectId)
      ).rejects.toThrow('Task not found');
    });

    it('should throw error if task update fails', async () => {
      mockTaskFindByIdAndUpdate.mockResolvedValueOnce(null); // Simulate update failure
      await expect(
        updateTaskProjectInDb(mockUserEmail, mockTaskId, mockNewProjectId)
      ).rejects.toThrow('Failed to update task');
    });
  });

  describe('deleteTaskInDb', () => {
    it('should delete a task successfully', async () => {
      mockTaskFindById.mockResolvedValueOnce(mockRawTask); // Task exists
      mockTaskFindByIdAndDelete.mockResolvedValueOnce(mockRawTask); // Deletion successful

      await deleteTaskInDb(mockTaskId);

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockTaskFindById).toHaveBeenCalledWith(mockTaskId);
      expect(mockTaskFindByIdAndDelete).toHaveBeenCalledWith(mockTaskId);
    });

    it('should throw error if task to delete is not found', async () => {
      mockTaskFindById.mockResolvedValueOnce(null); // Task does not exist
      await expect(deleteTaskInDb(mockTaskId)).rejects.toThrow(
        `Task with id ${mockTaskId} not found`
      );
      expect(mockTaskFindByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should throw error if database connection fails', async () => {
      mockConnect.mockRejectedValueOnce(new Error('DB Error'));
      await expect(deleteTaskInDb(mockTaskId)).rejects.toThrow('DB Error');
    });

    it('should throw error if findByIdAndDelete fails', async () => {
      mockTaskFindById.mockResolvedValueOnce(mockRawTask); // Task exists
      mockTaskFindByIdAndDelete.mockRejectedValueOnce(
        new Error('Deletion failed')
      ); // Deletion fails
      await expect(deleteTaskInDb(mockTaskId)).rejects.toThrow(
        'Deletion failed'
      );
    });
  });
});
