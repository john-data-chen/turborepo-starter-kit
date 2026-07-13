import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/lib/auth/auth-service";
import { useAuthStore } from "@/stores/auth";

import { Wrapper } from "./test-utils";

vi.mock("@/lib/auth/auth-service", () => ({
  authService: {
    getSession: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn()
  }
}));

vi.mock("@/stores/auth", () => {
  const setSession = vi.fn();
  const setUser = vi.fn();
  const clear = vi.fn();
  return {
    useAuthStore: Object.assign(
      vi.fn(() => ({ setSession, setUser, clear })),
      {
        getState: () => ({ user: { _id: "u1", email: "t@e.com", name: "Test" } })
      }
    )
  };
});

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return isAuthenticated false when no session", async () => {
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.getSession).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("should return session data when authenticated", async () => {
    const mockSession = {
      user: { _id: "1", email: "t@e.com", name: "Test" },
      accessToken: "tk"
    };
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.getSession).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user).toEqual(mockSession.user);
    expect(result.current.session).toEqual(mockSession);
  });

  it("should expose login function", () => {
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.getSession).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    expect(result.current.login).toBeDefined();
    expect(result.current.loginMutation).toBeDefined();
  });

  it("should call authService.logout and clear on logout", async () => {
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.getSession).mockResolvedValue(null);
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await result.current.logout();

    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    expect(authService.logout).toHaveBeenCalled();
    const mockValue = vi.mocked(useAuthStore).mock.results[0]?.value;
    const { clear } = mockValue ?? {};
    expect(clear).toHaveBeenCalled();
  });

  it("should return error from loginMutation or sessionQuery", async () => {
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.getSession).mockRejectedValue(new Error("Session failed"));

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // retry: false so it should surface the error
    expect(result.current.error).toBe("Session failed");
  });

  it("should handle login success with user from response", async () => {
    const mockUser = { _id: "u1", email: "t@e.com", name: "Test" };
    const mockLoginResponse = { access_token: "token123", user: mockUser };
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.getSession).mockResolvedValue(null);
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Trigger login
    result.current.login("t@e.com");

    await waitFor(() => {
      // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
      expect(authService.login).toHaveBeenCalledWith("t@e.com");
    });
  });

  it("should handle login success with getProfile fallback", async () => {
    const mockUser = { _id: "u1", email: "t@e.com", name: "Test" };
    const mockLoginResponse = { access_token: "token123", user: undefined };
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.getSession).mockResolvedValue(null);
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.login).mockResolvedValue(mockLoginResponse);
    // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
    vi.mocked(authService.getProfile).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Trigger login
    result.current.login("t@e.com");

    await waitFor(() => {
      // oxlint-disable-next-line typescript/unbound-method -- vi.mocked() on a vi.fn() mock is safe, no `this` binding involved
      expect(authService.login).toHaveBeenCalledWith("t@e.com");
    });
  });
});
