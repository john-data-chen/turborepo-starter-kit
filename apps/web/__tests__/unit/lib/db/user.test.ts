import { connectToDatabase } from '@/lib/db/connect';
import { getUserByEmail, getUserById } from '@/lib/db/user';
import mongoose from 'mongoose';
// Import the original function to mock it
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the connectToDatabase function
vi.mock('@/lib/db/connect', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined) // Mock it resolves successfully
}));

// Hoist the mock functions using vi.hoisted()
const mockLean = vi.hoisted(() => vi.fn());
const mockFindOne = vi.hoisted(() => vi.fn(() => ({ lean: mockLean })));

// Mock the UserModel and its methods using the hoisted functions
vi.mock('@/models/user.model', () => ({
  UserModel: {
    findOne: mockFindOne
  }
}));

describe('Database User Functions', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockUserEmail = 'test@example.com';
  const mockUserName = 'Test User';
  const mockUserDocument = {
    _id: new mongoose.Types.ObjectId(mockUserId),
    email: mockUserEmail,
    name: mockUserName,
    // Add other fields from your User model schema if necessary
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const expectedUserObject = {
    id: mockUserId,
    email: mockUserEmail,
    name: mockUserName
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.mocked(connectToDatabase).mockClear();
    mockFindOne.mockClear();
    mockLean.mockClear();
    // Reset mock implementations for lean
    mockLean.mockResolvedValue(null); // Default to not found
  });

  // --- Tests for getUserByEmail ---
  describe('getUserByEmail', () => {
    it('should call connectToDatabase', async () => {
      await getUserByEmail(mockUserEmail);
      expect(connectToDatabase).toHaveBeenCalledTimes(1);
    });

    it('should call UserModel.findOne with correct email', async () => {
      await getUserByEmail(mockUserEmail);
      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledWith({ email: mockUserEmail });
    });

    it('should call lean() on the query result', async () => {
      mockFindOne.mockReturnValueOnce({ lean: mockLean }); // Ensure findOne returns the object with lean
      await getUserByEmail(mockUserEmail);
      expect(mockLean).toHaveBeenCalledTimes(1);
    });

    it('should return formatted user object when user is found', async () => {
      mockLean.mockResolvedValueOnce(mockUserDocument); // Simulate user found
      const user = await getUserByEmail(mockUserEmail);
      expect(user).toEqual(expectedUserObject);
    });

    it('should return null when user is not found', async () => {
      mockLean.mockResolvedValueOnce(null); // Simulate user not found
      const user = await getUserByEmail(mockUserEmail);
      expect(user).toBeNull();
    });

    it('should return null and log error when database connection fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.mocked(connectToDatabase).mockRejectedValueOnce(
        new Error('Connection failed')
      );
      const user = await getUserByEmail(mockUserEmail);
      expect(user).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching user:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it('should return null and log error when findOne fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockFindOne.mockImplementationOnce(() => {
        throw new Error('Find failed');
      }); // Simulate findOne throwing an error directly
      const user = await getUserByEmail(mockUserEmail);
      expect(user).toBeNull();
      expect(mockLean).not.toHaveBeenCalled(); // lean should not be called if findOne throws
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching user:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  // --- Tests for getUserById ---
  describe('getUserById', () => {
    it('should call connectToDatabase', async () => {
      await getUserById(mockUserId);
      expect(connectToDatabase).toHaveBeenCalledTimes(1);
    });

    it('should call UserModel.findOne with correct id', async () => {
      await getUserById(mockUserId);
      expect(mockFindOne).toHaveBeenCalledTimes(1);
      // Mongoose automatically converts string ID to ObjectId for _id queries
      expect(mockFindOne).toHaveBeenCalledWith({ _id: mockUserId });
    });

    it('should call lean() on the query result', async () => {
      mockFindOne.mockReturnValueOnce({ lean: mockLean }); // Ensure findOne returns the object with lean
      await getUserById(mockUserId);
      expect(mockLean).toHaveBeenCalledTimes(1);
    });

    it('should return formatted user object when user is found', async () => {
      mockLean.mockResolvedValueOnce(mockUserDocument); // Simulate user found
      const user = await getUserById(mockUserId);
      expect(user).toEqual(expectedUserObject);
    });

    it('should return null when user is not found', async () => {
      mockLean.mockResolvedValueOnce(null); // Simulate user not found
      const user = await getUserById(mockUserId);
      expect(user).toBeNull();
    });

    it('should return null and log error when database connection fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.mocked(connectToDatabase).mockRejectedValueOnce(
        new Error('Connection failed')
      );
      const user = await getUserById(mockUserId);
      expect(user).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching user:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    it('should return null and log error when findOne fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockFindOne.mockImplementationOnce(() => {
        throw new Error('Find failed');
      }); // Simulate findOne throwing an error directly
      const user = await getUserById(mockUserId);
      expect(user).toBeNull();
      expect(mockLean).not.toHaveBeenCalled(); // lean should not be called if findOne throws
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching user:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
