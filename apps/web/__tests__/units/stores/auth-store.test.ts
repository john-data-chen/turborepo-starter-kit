import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/stores/auth-store";
import { Session, UserInfo } from "@/types/dbInterface";

// Mock localStorage for persist middleware
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true
});

describe("auth-store", () => {
  beforeEach(() => {
    // Reset the store before each test
    useAuthStore.getState().clear();
    vi.clearAllMocks();
  });

  it("should have initial state", () => {
    const state = useAuthStore.getState();

    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should set session", () => {
    const mockSession: Session = {
      user: {
        _id: "123",
        email: "test@example.com",
        name: "Test User"
      },
      accessToken: "mock-token"
    };

    useAuthStore.getState().setSession(mockSession);

    const state = useAuthStore.getState();
    expect(state.session).toEqual(mockSession);
  });

  it("should set user", () => {
    const mockUser: UserInfo = {
      _id: "123",
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  it("should set loading state", () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("should set error", () => {
    const errorMessage = "Authentication failed";

    useAuthStore.getState().setError(errorMessage);

    expect(useAuthStore.getState().error).toBe(errorMessage);
  });

  it("should clear error", () => {
    useAuthStore.getState().setError("Some error");
    useAuthStore.getState().setError(null);

    expect(useAuthStore.getState().error).toBeNull();
  });

  it("should clear all state", () => {
    // Set up some state
    const mockSession: Session = {
      user: {
        _id: "123",
        email: "test@example.com",
        name: "Test User"
      },
      accessToken: "mock-token"
    };

    const mockUser: UserInfo = {
      _id: "123",
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    useAuthStore.getState().setSession(mockSession);
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setLoading(true);
    useAuthStore.getState().setError("Some error");

    // Clear all state
    useAuthStore.getState().clear();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should update state independently", () => {
    const mockUser: UserInfo = {
      _id: "123",
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setLoading(true);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(true);
    expect(state.session).toBeNull();
    expect(state.error).toBeNull();
  });

  it("should handle session with null user", () => {
    useAuthStore.getState().setSession(null);

    expect(useAuthStore.getState().session).toBeNull();
  });

  it("should handle null user", () => {
    const mockUser: UserInfo = {
      _id: "123",
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);

    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
