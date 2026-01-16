import { beforeEach, describe, expect, it, vi } from "vitest";

import { boardApi } from "@/lib/api/boardApi";
import type { Board } from "@/types/dbInterface";

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

describe("boardApi", () => {
  const mockBoard: Board = {
    _id: "board-1",
    title: "Test Board",
    description: "Test Description",
    owner: "user-1",
    members: [],
    projects: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("getBoards", () => {
    it("should fetch all boards", async () => {
      const mockResponse = {
        myBoards: [mockBoard],
        teamBoards: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockResponse)
      });

      const result = await boardApi.getBoards();

      expect(result.myBoards).toHaveLength(1);
      expect(result.myBoards[0]._id).toBe("board-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/boards"),
        expect.objectContaining({
          credentials: "include"
        })
      );
    });

    it("should include auth token when available", async () => {
      localStorageMock.getItem.mockReturnValueOnce("test-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ myBoards: [], teamBoards: [] })
      });

      await boardApi.getBoards();

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

  describe("getBoardById", () => {
    it("should fetch a single board", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockBoard)
      });

      const result = await boardApi.getBoardById("board-1");

      expect(result._id).toBe("board-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/boards/board-1"),
        expect.any(Object)
      );
    });

    it("should handle not found error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => JSON.stringify({ message: "Board not found" })
      });

      await expect(boardApi.getBoardById("non-existent")).rejects.toThrow("Board not found");
    });
  });

  describe("createBoard", () => {
    it("should create a new board", async () => {
      const input = {
        title: "New Board",
        description: "New Description",
        owner: "user-1"
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockBoard)
      });

      const result = await boardApi.createBoard(input);

      expect(result._id).toBe("board-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/boards"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(input)
        })
      );
    });
  });

  describe("updateBoard", () => {
    it("should update a board", async () => {
      const input = {
        title: "Updated Board"
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ ...mockBoard, title: "Updated Board" })
      });

      const result = await boardApi.updateBoard("board-1", input);

      expect(result.title).toBe("Updated Board");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/boards/board-1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(input)
        })
      );
    });
  });

  describe("deleteBoard", () => {
    it("should delete a board", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({})
      });

      await boardApi.deleteBoard("board-1");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/boards/board-1"),
        expect.objectContaining({
          method: "DELETE"
        })
      );
    });

    it("should handle empty response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => ""
      });

      await expect(boardApi.deleteBoard("board-1")).rejects.toThrow("Empty response from server");
    });
  });

  describe("addBoardMember", () => {
    it("should add a member to a board", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            ...mockBoard,
            members: [{ _id: "user-2", name: "New Member", email: "member@example.com" }]
          })
      });

      const result = await boardApi.addBoardMember("board-1", "user-2");

      expect(result.members).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/boards/board-1/members/user-2"),
        expect.objectContaining({
          method: "POST"
        })
      );
    });
  });

  describe("error handling", () => {
    it("should handle JSON parse error in error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Invalid JSON"
      });

      await expect(boardApi.getBoards()).rejects.toThrow("Invalid JSON");
    });

    it("should handle empty error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => ""
      });

      await expect(boardApi.getBoards()).rejects.toThrow("Internal Server Error");
    });

    it("should handle fetch network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(boardApi.getBoards()).rejects.toThrow("Network error");
    });

    it("should handle 401 unauthorized", async () => {
      // Mock window.location
      const mockLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => JSON.stringify({ message: "Unauthorized" })
      });

      await expect(boardApi.getBoards()).rejects.toThrow("Unauthorized");
      expect(mockLocation.href).toBe("/login");
    });

    it("should handle empty response from server", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => ""
      });

      await expect(boardApi.getBoards()).rejects.toThrow("Empty response from server");
    });
  });

  describe("header handling", () => {
    it("should handle Headers object", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ myBoards: [], teamBoards: [] })
      });

      await boardApi.getBoards();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json"
          })
        })
      );
    });

    it("should merge headers correctly", async () => {
      localStorageMock.getItem.mockReturnValueOnce("test-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ myBoards: [], teamBoards: [] })
      });

      await boardApi.getBoards();

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;

      expect(headers).toHaveProperty("Content-Type", "application/json");
      expect(headers).toHaveProperty("Authorization", "Bearer test-token");
    });
  });
});
