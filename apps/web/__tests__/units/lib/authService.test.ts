import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthService } from "@/lib/auth/authService";

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

// Mock js-cookie
vi.mock("js-cookie", () => ({
  default: {
    remove: vi.fn()
  }
}));

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const mockResponse = {
        access_token: "test-token",
        user: {
          _id: "user-123",
          email: "test@example.com",
          name: "Test User"
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200
      });

      const result = await AuthService.login("test@example.com");

      expect(result.access_token).toBe("test-token");
      expect(result.user).toEqual(mockResponse.user);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("auth_token", "test-token");
    });

    it("should handle login without access token", async () => {
      const mockResponse = {
        user: {
          _id: "user-123",
          email: "test@example.com",
          name: "Test User"
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200
      });

      const result = await AuthService.login("test@example.com");

      expect(result.access_token).toBe("http-only-cookie");
      expect(result.user).toEqual(mockResponse.user);
    });

    it("should throw error on failed login", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "Invalid credentials"
      });

      await expect(AuthService.login("invalid@example.com")).rejects.toMatchObject({
        message: expect.stringContaining("Invalid credentials")
      });
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(AuthService.login("test@example.com")).rejects.toMatchObject({
        message: expect.stringContaining("Network error")
      });
    });

    it("should handle failed text parsing in error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => {
          throw new Error("Failed to parse");
        }
      });

      await expect(AuthService.login("test@example.com")).rejects.toMatchObject({
        message: expect.stringContaining("Login failed")
      });
    });
  });

  describe("getProfile", () => {
    it("should successfully fetch user profile with token", async () => {
      const mockUser = {
        _id: "user-123",
        email: "test@example.com",
        name: "Test User"
      };

      localStorageMock.getItem.mockReturnValueOnce("test-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
        status: 200
      });

      const result = await AuthService.getProfile();

      expect(result).toEqual({
        _id: "user-123",
        email: "test@example.com",
        name: "Test User"
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token"
          })
        })
      );
    });

    it("should fetch profile without Authorization header when no token", async () => {
      const mockUser = {
        _id: "user-123",
        email: "test@example.com",
        name: "Test User"
      };

      localStorageMock.getItem.mockReturnValueOnce(null);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
        status: 200
      });

      const result = await AuthService.getProfile();

      expect(result).toEqual({
        _id: "user-123",
        email: "test@example.com",
        name: "Test User"
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String)
          })
        })
      );
    });

    it("should use email as fallback for name", async () => {
      const mockUser = {
        _id: "user-123",
        email: "test@example.com"
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
        status: 200
      });

      const result = await AuthService.getProfile();

      expect(result.name).toBe("test");
    });

    it("should throw error on 401 and call logout", async () => {
      const logoutSpy = vi.spyOn(AuthService, "logout");

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "Unauthorized"
      });

      await expect(AuthService.getProfile()).rejects.toMatchObject({
        message: expect.stringContaining("Failed to fetch user profile")
      });
      expect(logoutSpy).toHaveBeenCalled();
    });

    it("should throw error on invalid user data", async () => {
      const mockUser = {
        _id: "user-123"
        // missing email
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
        status: 200
      });

      await expect(AuthService.getProfile()).rejects.toMatchObject({
        message: expect.stringContaining("Invalid user data received from server")
      });
    });

    it("should throw error on null user data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
        status: 200
      });

      await expect(AuthService.getProfile()).rejects.toMatchObject({
        message: expect.stringContaining("Invalid user data received from server")
      });
    });

    it("should handle text parsing errors in profile fetch", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => {
          throw new Error("Failed to parse");
        }
      });

      await expect(AuthService.getProfile()).rejects.toMatchObject({
        message: expect.stringContaining("Failed to fetch user profile")
      });
    });
  });

  describe("getSession", () => {
    it("should successfully get session with valid profile", async () => {
      const mockUser = {
        _id: "user-123",
        email: "test@example.com",
        name: "Test User"
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
        status: 200
      });

      const session = await AuthService.getSession();

      expect(session).toEqual({
        user: {
          _id: "user-123",
          email: "test@example.com",
          name: "Test User"
        },
        accessToken: "http-only-cookie"
      });
    });

    it("should return null when profile fetch fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "Unauthorized"
      });

      const session = await AuthService.getSession();

      expect(session).toBeNull();
    });

    it("should use email prefix as fallback name in session", async () => {
      const mockUser = {
        _id: "user-123",
        email: "john.doe@example.com"
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
        status: 200
      });

      const session = await AuthService.getSession();

      expect(session?.user.name).toBe("john.doe");
    });
  });

  describe("logout", () => {
    it("should remove auth token and jwt cookie", async () => {
      const { default: Cookies } = await import("js-cookie");

      AuthService.logout();

      expect(Cookies.remove).toHaveBeenCalledWith("jwt", { path: "/" });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("auth_token");
    });

    it("should handle logout when window is undefined", () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - Testing undefined window
      delete (globalThis as any).window;

      expect(() => {
        AuthService.logout();
      }).not.toThrow();

      (globalThis as any).window = originalWindow;
    });
  });
});
