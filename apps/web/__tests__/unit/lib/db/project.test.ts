/// <reference types="vitest/globals" />
import { connectToDatabase } from '@/lib/db/connect';
import { createProjectInDb, getProjectsFromDb } from '@/lib/db/project';
import { getUserByEmail, getUserById } from '@/lib/db/user';
import { BoardModel } from '@/models/board.model';
import { ProjectModel } from '@/models/project.model';
import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

// Mock dependencies
vi.mock('@/lib/db/connect');
vi.mock('@/lib/db/user');
vi.mock('@/models/project.model');
vi.mock('@/models/board.model');

// Get typed mocks
const mockConnect = vi.mocked(connectToDatabase);
const mockGetUserByEmail = vi.mocked(getUserByEmail);
const mockGetUserById = vi.mocked(getUserById);

// Define a schema for project creation for testing purposes
const projectTestSchema = z.object({
  title: z.string(),
  description: z.string(),
  board: z.string(),
  userEmail: z.string().email()
});

describe('Database Project Functions', () => {
  const mockBoardId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();
  const mockUserEmail = 'test@example.com';
  const mockUserName = 'Test User';
  const mockLean = vi.fn();
  const mockNewProjectId = new Types.ObjectId().toString();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockResolvedValue(undefined);
    mockGetUserByEmail.mockResolvedValue({
      id: mockUserId,
      name: mockUserName,
      email: mockUserEmail
    });
    mockGetUserById.mockResolvedValue({
      id: mockUserId,
      name: mockUserName,
      email: mockUserEmail
    });
    vi.mocked(ProjectModel.find).mockImplementation(
      () => ({ lean: mockLean }) as any
    );
  });

  describe('getProjectsFromDb', () => {
    it('should fetch, convert, and populate projects correctly', async () => {
      const mockRawProjects = [
        {
          _id: 'proj1',
          title: 'Test Project',
          description: 'A test',
          owner: mockUserId,
          members: [mockUserId],
          board: mockBoardId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      mockLean.mockResolvedValue(mockRawProjects);

      const result = await getProjectsFromDb(mockBoardId);

      expect(ProjectModel.find).toHaveBeenCalledWith({
        board: new Types.ObjectId(mockBoardId)
      });
      // getUserById is called for the unique IDs in owner and members.
      // In this case, owner is one call, and the member in the array is a second call.
      expect(mockGetUserById).toHaveBeenCalledWith(mockUserId);
      expect(mockGetUserById).toHaveBeenCalledTimes(2);

      // Assert the final, transformed shape
      expect(result).toHaveLength(1);
      expect(result![0]).toEqual(
        expect.objectContaining({
          _id: 'proj1',
          title: 'Test Project',
          owner: { id: mockUserId, name: mockUserName },
          members: [{ id: mockUserId, name: mockUserName }]
        })
      );
    });

    it('should return an empty array if an error occurs', async () => {
      mockLean.mockRejectedValue(new Error('DB Error'));
      const result = await getProjectsFromDb(mockBoardId);
      expect(result).toEqual([]);
    });
  });

  describe('createProjectInDb', () => {
    it('should create a project successfully and return the populated object', async () => {
      const createData: z.infer<typeof projectTestSchema> = {
        title: 'New Project',
        description: 'A new project',
        board: mockBoardId,
        userEmail: mockUserEmail
      };

      const mockCreatedDoc = {
        ...createData,
        _id: new Types.ObjectId(mockNewProjectId),
        owner: new Types.ObjectId(mockUserId),
        members: [new Types.ObjectId(mockUserId)],
        board: new Types.ObjectId(mockBoardId),
        toObject: () => ({
          _id: mockNewProjectId,
          owner: mockUserId,
          members: [mockUserId],
          board: mockBoardId,
          title: 'New Project'
        })
      };

      vi.mocked(ProjectModel.create).mockResolvedValue(mockCreatedDoc as any);
      vi.mocked(BoardModel.findByIdAndUpdate).mockResolvedValue({} as any);

      const result = await createProjectInDb(createData);

      expect(ProjectModel.create).toHaveBeenCalled();
      expect(BoardModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockGetUserById).toHaveBeenCalledWith(mockUserId);
      expect(mockGetUserById).toHaveBeenCalledTimes(2);

      // Assert the final shape after `convertProjectToPlainObject`
      expect(result).toEqual(
        expect.objectContaining({
          _id: mockNewProjectId,
          title: 'New Project',
          owner: { id: mockUserId, name: mockUserName },
          members: [{ id: mockUserId, name: mockUserName }]
        })
      );
    });
  });
});
