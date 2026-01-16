import { beforeEach, describe, expect, it, vi } from "vitest";

import { userApi } from "@/lib/api/userApi";
import type { ApiUser } from "@/types/userApi";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true
});

describe("userApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("searchUsers", () => {
    it("should search users successfully", async () => {
      const mockApiUsers: ApiUser[] = [
        {
          _id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        },
        {
          _id: "user-2",
          name: "Jane Smith",
          email: "jane@example.com",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z"
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockApiUsers })
      });

      const result = await userApi.searchUsers("john");

      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe("user-1");
      expect(result[0].name).toBe("John Doe");
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it("should search users with empty query", async () => {
      const mockApiUsers: ApiUser[] = [];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockApiUsers })
      });

      const result = await userApi.searchUsers("");

      expect(result).toEqual([]);
    });

    it("should handle empty users response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: null })
      });

      const result = await userApi.searchUsers("test");

      expect(result).toEqual([]);
    });

    it("should include auth token in request", async () => {
      localStorageMock.getItem.mockReturnValueOnce("test-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      });

      await userApi.searchUsers("test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token"
          })
        })
      );
    });

    it("should handle search errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Server error"
      });

      await expect(userApi.searchUsers("test")).rejects.toThrow("Server error");
    });
  });

  describe("getUserById", () => {
    it("should get user by ID successfully", async () => {
      const mockApiUser: ApiUser = {
        _id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockApiUser })
      });

      const result = await userApi.getUserById("user-1");

      expect(result?._id).toBe("user-1");
      expect(result?.name).toBe("John Doe");
      expect(result?.createdAt).toBeInstanceOf(Date);
    });

    it("should return null when user not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "404 Not found"
      });

      const result = await userApi.getUserById("non-existent");

      expect(result).toBeNull();
    });

    it("should return null when user is null in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: null })
      });

      const result = await userApi.getUserById("user-1");

      expect(result).toBeNull();
    });

    it("should throw on non-404 errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Server error"
      });

      await expect(userApi.getUserById("user-1")).rejects.toThrow("Server error");
    });

    it("should include auth token in request", async () => {
      localStorageMock.getItem.mockReturnValueOnce("test-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            _id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z"
          }
        })
      });

      await userApi.getUserById("user-1");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token"
          })
        })
      );
    });
  });

  describe("fetchWithAuth error handling", () => {
    it("should handle 401 errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Unauthorized"
      });

      await expect(userApi.searchUsers("test")).rejects.toThrow("Unauthorized");
    });

    it("should handle error text parsing failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => {
          throw new Error("Failed to parse");
        }
      });

      await expect(userApi.searchUsers("test")).rejects.toThrow("Request failed");
    });
  });

  describe("header handling", () => {
    it("should include credentials in request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      });

      await userApi.searchUsers("test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: "include"
        })
      );
    });

    it("should include Content-Type header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      });

      await userApi.searchUsers("test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json"
          })
        })
      );
    });

    it("should not include Authorization header when no token", async () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      });

      await userApi.searchUsers("test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String)
          })
        })
      );
    });
  });
});
