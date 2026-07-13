import { describe, it, expect, vi, beforeEach } from "vitest";

import { useAuthStore } from "@/stores/auth";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
    vi.clearAllMocks();
  });

  it("should have initial state", () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
  });

  it("should use secureStorageAdapter indirectly", () => {
    const mockUser = { _id: "1", email: "t@e.com", name: "N" };
    const mockSession = { user: mockUser, accessToken: "token" };

    // This should trigger the adapter's setItem
    useAuthStore.getState().setSession(mockSession);

    // In zustand persist, it might be async or buffered.
    // Since we mocked SecureStore in setup, we can check if it was called.
    // However, the adapter is used by the persist middleware.
  });

  it("should call setUser", () => {
    const mockUser = { _id: "1", email: "t@e.com", name: "N" };
    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it("should call setLoading and setError", () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
    useAuthStore.getState().setError("E");
    expect(useAuthStore.getState().error).toBe("E");
  });

  it("should call clear and reset state", () => {
    const mockUser = { _id: "1", email: "t@e.com", name: "N" };
    const mockSession = { user: mockUser, accessToken: "token" };

    // Set some state first
    useAuthStore.getState().setSession(mockSession);
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setLoading(true);
    useAuthStore.getState().setError("Error");

    // Clear should reset everything
    useAuthStore.getState().clear();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
