import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React, { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth, useAuthForm } from "@/hooks/useAuth";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AuthService } from "@/lib/auth/authService";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

vi.mock("@/lib/auth/authService");
vi.mock("@/stores/auth-store");
vi.mock("@/stores/workspace-store");

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => "/en/boards")
}));

vi.mock("@/constants/routes", () => ({
  API_URL: "http://localhost:3001",
  ROUTES: { AUTH: { LOGIN_PAGE: "/login" } },
  URL_PARAMS: { LOGIN_SUCCESS: "login_success=true" }
}));

const mockUser = { _id: "123", email: "test@example.com", name: "Test User" };
const replace = vi.fn();
const push = vi.fn();

function setCookie(value: string) {
  Object.defineProperty(document, "cookie", {
    get: () => value,
    configurable: true
  });
}

function setLocalStorage(token: string | null) {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: vi.fn(() => token),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    writable: true,
    configurable: true
  });
}

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });

  vi.mocked(useRouter).mockReturnValue({ replace, push } as any);
  vi.mocked(usePathname).mockReturnValue("/en/boards");
  vi.mocked(AuthService.getProfile).mockResolvedValue(mockUser);
  vi.mocked(AuthService.login).mockResolvedValue({ access_token: "token", user: mockUser } as any);
  vi.mocked(AuthService.logout).mockResolvedValue(undefined);

  const authStoreState = { setUser: vi.fn(), clear: vi.fn() };
  vi.mocked(useAuthStore).mockImplementation((s: any) => (s ? s(authStoreState) : authStoreState));
  (useAuthStore as any).getState = () => authStoreState;

  const wsState = { userId: null, setUserInfo: vi.fn() };
  vi.mocked(useWorkspaceStore).mockImplementation((s: any) => (s ? s(wsState) : wsState));
  (useWorkspaceStore as any).getState = () => wsState;

  Object.defineProperty(window, "location", {
    value: { pathname: "/en/boards", href: "", search: "" },
    writable: true,
    configurable: true
  });
  setCookie("jwt=abc");
  setLocalStorage("mock_token");
});

afterEach(() => {
  queryClient.clear();
});

describe("useAuth mount session check", () => {
  it("checks session and authenticates when auth cookie present on a protected page", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(AuthService.getProfile).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockUser);
  });

  it("leaves session null when getProfile fails on mount", async () => {
    vi.mocked(AuthService.getProfile).mockRejectedValue(new Error("no session"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("skips session check when no cookie and no stored token", async () => {
    setCookie("");
    setLocalStorage(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(AuthService.getProfile).not.toHaveBeenCalled();
  });
});

describe("useAuth login + logout branches", () => {
  it("falls back to getProfile when login returns no user", async () => {
    vi.mocked(usePathname).mockReturnValue("/en/login");
    setCookie("");
    setLocalStorage(null);
    vi.mocked(AuthService.login).mockResolvedValue({ access_token: "token" } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("test@example.com");
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(AuthService.getProfile).toHaveBeenCalled();
  });

  it("redirects to login even when logout fails", async () => {
    vi.mocked(usePathname).mockReturnValue("/en/login");
    setCookie("");
    setLocalStorage(null);
    vi.mocked(AuthService.logout).mockRejectedValue(new Error("logout failed"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(replace).toHaveBeenCalledWith("/login");
  });
});

describe("useAuthForm redirect", () => {
  it("pushes the cleaned callbackUrl after a successful login", async () => {
    vi.useFakeTimers();
    vi.mocked(usePathname).mockReturnValue("/en/login");
    setCookie("");
    setLocalStorage(null);
    Object.defineProperty(window, "location", {
      value: { pathname: "/en/login", href: "", search: "?callbackUrl=/en/boards/123" },
      writable: true,
      configurable: true
    });

    const { result } = renderHook(() => useAuthForm(), { wrapper });

    await act(async () => {
      await result.current.handleSubmit("test@example.com");
    });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(push).toHaveBeenCalledWith("/boards/123");
    vi.useRealTimers();
  });
});
