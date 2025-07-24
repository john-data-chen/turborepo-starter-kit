import {
  createBoardInDb,
  deleteBoardInDb,
  fetchBoardsFromDb,
  updateBoardInDb
} from '@/lib/db/board';
import { Board, UserInfo } from '@/types/dbInterface';
import { Types } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
const mockConnect = vi.hoisted(() => vi.fn());
const mockGetUserByEmail = vi.hoisted(() => vi.fn());
const mockGetUserById = vi.hoisted(() => vi.fn());

const mockBoardLean = vi.hoisted(() => vi.fn());
const mockBoardFind = vi.hoisted(() => vi.fn(() => ({ lean: mockBoardLean })));
const mockBoardFindById = vi.hoisted(() => vi.fn());
const mockBoardCreate = vi.hoisted(() => vi.fn());
const mockBoardFindByIdAndUpdate = vi.hoisted(() => vi.fn());
const mockBoardFindByIdAndDelete = vi.hoisted(() => vi.fn());

const mockProjectLean = vi.hoisted(() => vi.fn());
const mockProjectFind = vi.hoisted(() =>
  vi.fn(() => ({ lean: mockProjectLean }))
);
const mockProjectDeleteMany = vi.hoisted(() => vi.fn());

const mockTaskDeleteMany = vi.hoisted(() => vi.fn());

// Mock modules
vi.mock('@/lib/db/connect', () => ({
  connectToDatabase: mockConnect
}));

vi.mock('@/lib/db/user', () => ({
  getUserByEmail: mockGetUserByEmail,
  getUserById: mockGetUserById
}));

vi.mock('@/models/board.model', () => ({
  BoardModel: {
    find: mockBoardFind,
    findById: mockBoardFindById,
    create: mockBoardCreate,
    findByIdAndUpdate: mockBoardFindByIdAndUpdate,
    findByIdAndDelete: mockBoardFindByIdAndDelete
  }
}));

vi.mock('@/models/project.model', () => ({
  ProjectModel: {
    find: mockProjectFind,
    deleteMany: mockProjectDeleteMany
  }
}));

vi.mock('@/models/task.model', () => ({
  TaskModel: {
    deleteMany: mockTaskDeleteMany
  }
}));

describe('Board Database Functions', () => {
  const mockUserId = new Types.ObjectId().toString();
  const mockUserEmail = 'test@example.com';
  const mockUserName = 'Test User';
  const mockUserInfo: UserInfo = { id: mockUserId, name: mockUserName };

  const mockBoardId = new Types.ObjectId().toString();
  const mockProjectId = new Types.ObjectId().toString();

  const mockBoard = {
    _id: new Types.ObjectId(mockBoardId),
    title: 'Test Board',
    description: 'Test Description',
    owner: new Types.ObjectId(mockUserId),
    members: [new Types.ObjectId(mockUserId)],
    projects: [new Types.ObjectId(mockProjectId)],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockProject = {
    _id: new Types.ObjectId(mockProjectId),
    title: 'Test Project'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockResolvedValue(undefined);
    mockGetUserByEmail.mockResolvedValue(mockUserInfo);
    mockGetUserById.mockResolvedValue(mockUserInfo);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchBoardsFromDb', () => {
    it('should fetch and transform boards successfully', async () => {
      mockBoardLean.mockReturnValue([mockBoard]);
      mockProjectLean.mockReturnValue([mockProject]);

      const result = await fetchBoardsFromDb(mockUserEmail);

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockBoardFind).toHaveBeenCalledWith({
        $or: [{ owner: mockUserId }, { members: mockUserId }]
      });
    });

    it('should return empty array when user not found', async () => {
      mockGetUserByEmail.mockResolvedValueOnce(null);

      const result = await fetchBoardsFromDb(mockUserEmail);

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockBoardFind.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const result = await fetchBoardsFromDb(mockUserEmail);

      expect(result).toEqual([]);
    });
  });

  describe('createBoardInDb', () => {
    const createData = {
      title: 'New Board',
      description: 'New Description',
      userEmail: mockUserEmail
    };

    it('should create a board successfully', async () => {
      const newBoard = {
        ...mockBoard,
        title: createData.title,
        description: createData.description
      };
      mockBoardCreate.mockResolvedValueOnce(newBoard);

      const result = await createBoardInDb(createData);

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockGetUserByEmail).toHaveBeenCalledWith(mockUserEmail);
      expect(mockBoardCreate).toHaveBeenCalledWith({
        title: createData.title,
        description: createData.description,
        owner: mockUserId,
        members: [mockUserId],
        projects: []
      });
    });

    it('should return null when user not found', async () => {
      mockGetUserByEmail.mockResolvedValueOnce(null);

      const result = await createBoardInDb(createData);

      expect(result).toBeNull();
      expect(mockBoardCreate).not.toHaveBeenCalled();
    });
  });

  describe('updateBoardInDb', () => {
    const updateData = {
      title: 'Updated Board',
      description: 'Updated Description'
    };

    it('should update board successfully', async () => {
      mockBoardFindById.mockResolvedValueOnce({
        ...mockBoard,
        lean: () => mockBoard
      });
      mockBoardFindByIdAndUpdate.mockResolvedValueOnce({
        ...mockBoard,
        ...updateData,
        lean: () => ({ ...mockBoard, ...updateData })
      });

      const result = await updateBoardInDb(
        mockBoardId,
        updateData,
        mockUserEmail
      );

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockGetUserByEmail).toHaveBeenCalledWith(mockUserEmail);
    });

    it('should return null when board not found', async () => {
      mockBoardFindById.mockResolvedValueOnce(null);

      const result = await updateBoardInDb(
        mockBoardId,
        updateData,
        mockUserEmail
      );

      expect(result).toBeNull();
    });

    it('should return null when user is not owner', async () => {
      const differentUserId = new Types.ObjectId().toString();
      mockBoardFindById.mockResolvedValueOnce({
        ...mockBoard,
        owner: new Types.ObjectId(differentUserId),
        lean: () => ({
          ...mockBoard,
          owner: new Types.ObjectId(differentUserId)
        })
      });

      const result = await updateBoardInDb(
        mockBoardId,
        updateData,
        mockUserEmail
      );

      expect(result).toBeNull();
    });
  });

  describe('deleteBoardInDb', () => {
    it('should delete board successfully', async () => {
      mockBoardFindById.mockResolvedValueOnce({
        ...mockBoard,
        lean: () => mockBoard
      });

      const result = await deleteBoardInDb(mockBoardId, mockUserEmail);

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockGetUserByEmail).toHaveBeenCalledWith(mockUserEmail);
    });

    it('should return false when board not found', async () => {
      mockBoardFindById.mockResolvedValueOnce(null);

      const result = await deleteBoardInDb(mockBoardId, mockUserEmail);

      expect(result).toBe(false);
    });

    it('should return false when user is not owner', async () => {
      const differentUserId = new Types.ObjectId().toString();
      mockBoardFindById.mockResolvedValueOnce({
        ...mockBoard,
        owner: new Types.ObjectId(differentUserId),
        lean: () => ({
          ...mockBoard,
          owner: new Types.ObjectId(differentUserId)
        })
      });

      const result = await deleteBoardInDb(mockBoardId, mockUserEmail);

      expect(result).toBe(false);
    });
  });
});
