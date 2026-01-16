import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React, { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth, useAuthForm } from "@/hooks/useAuth";
import { AuthService } from "@/lib/auth/authService";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

// Mock external modules
vi.mock("@/lib/auth/authService");
vi.mock("@/stores/auth-store");
vi.mock("@/stores/workspace-store");

// Mock the getLocalePath function from @repo/ui/lib/utils
vi.mock("@repo/ui/lib/utils", () => ({
  getLocalePath: vi.fn((path) => `/en${path}`)
}));

// Mock routing
vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["en", "zh-TW"],
    defaultLocale: "en"
  }
}));

vi.mock("@/constants/routes", () => ({
  API_URL: "http://localhost:3001",
  ROUTES: {
    HOME: "/",
    API: "http://localhost:3001",
    AUTH: {
      LOGIN_API: "http://localhost:3001/auth/login",
      LOGIN_PAGE: "/login"
    },
    BOARDS: {
      OVERVIEW_PAGE: "/boards"
    }
  },
  URL_PARAMS: {
    LOGIN_SUCCESS: "login_success=true"
  }
}));

describe("useAuth", () => {
  const mockUser = { _id: "123", email: "test@example.com", name: "Test User" };
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Setup default mocks
    vi.mocked(AuthService.getProfile).mockResolvedValue(mockUser);
    vi.mocked(AuthService.login).mockResolvedValue({ access_token: "token", user: mockUser });
    vi.mocked(AuthService.logout).mockResolvedValue(undefined);

    // Mock useAuthStore with Zustand selector pattern
    const authStoreState = {
      user: null,
      session: null,
      isLoading: false,
      error: null,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clear: vi.fn()
    };

    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      return selector ? selector(authStoreState) : authStoreState;
    });
    (useAuthStore as any).getState = () => authStoreState;

    // Mock useWorkspaceStore with Zustand selector pattern
    const workspaceStoreState = {
      userId: null,
      userEmail: null,
      setUserInfo: vi.fn(),
      projects: [],
      isLoadingProjects: false,
      setProjects: vi.fn(),
      currentBoardId: null,
      myBoards: [],
      teamBoards: [],
      filter: { status: null, search: "" },
      fetchProjects: vi.fn(),
      fetchTasksByProject: vi.fn(),
      addProject: vi.fn(),
      updateProject: vi.fn(),
      removeProject: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      removeTask: vi.fn(),
      dragTaskOnProject: vi.fn(),
      setCurrentBoardId: vi.fn(),
      addBoard: vi.fn(),
      updateBoard: vi.fn(),
      removeBoard: vi.fn(),
      setFilter: vi.fn(),
      setMyBoards: vi.fn(),
      setTeamBoards: vi.fn(),
      resetInBoards: vi.fn()
    };

    vi.mocked(useWorkspaceStore).mockImplementation((selector: any) => {
      return selector ? selector(workspaceStoreState) : workspaceStoreState;
    });
    (useWorkspaceStore as any).getState = () => workspaceStoreState;

    // Mock window.location.pathname for getCurrentLocale
    Object.defineProperty(window, "location", {
      value: { pathname: "/en/login", href: "" },
      writable: true,
      configurable: true
    });

    // Mock document.cookie
    Object.defineProperty(document, "cookie", {
      get: vi.fn(() => "jwt=mock_jwt; isAuthenticated=true"),
      configurable: true
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => "mock_token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("should initialize with loading state on mount", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it("should handle successful login", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.login("test@example.com");

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    expect(AuthService.login).toHaveBeenCalledWith("test@example.com");
  });

  it("should handle login errors", async () => {
    const loginError = new Error("Invalid credentials");
    vi.mocked(AuthService.login).mockRejectedValue(loginError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(result.current.login("wrong@example.com")).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe("Invalid credentials");
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it("should handle logout", async () => {
    // First login
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.login("test@example.com");

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Mock window.location
    const mockLocation = { href: "" };
    Object.defineProperty(window, "location", {
      writable: true,
      value: mockLocation
    });

    // Then logout
    await result.current.logout();

    expect(AuthService.logout).toHaveBeenCalled();
    expect(mockLocation.href).toBe("/login");
  });
});

describe("useAuthForm", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    const mockUser = { _id: "123", email: "test@example.com", name: "Test User" };
    vi.mocked(AuthService.login).mockResolvedValue({ access_token: "token", user: mockUser });

    // Mock useAuthStore with Zustand selector pattern
    const authStoreState = {
      user: null,
      session: null,
      isLoading: false,
      error: null,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clear: vi.fn()
    };

    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      return selector ? selector(authStoreState) : authStoreState;
    });
    (useAuthStore as any).getState = () => authStoreState;

    // Mock useWorkspaceStore with Zustand selector pattern
    const workspaceStoreState = {
      userId: null,
      userEmail: null,
      setUserInfo: vi.fn(),
      projects: [],
      isLoadingProjects: false,
      setProjects: vi.fn(),
      currentBoardId: null,
      myBoards: [],
      teamBoards: [],
      filter: { status: null, search: "" },
      fetchProjects: vi.fn(),
      fetchTasksByProject: vi.fn(),
      addProject: vi.fn(),
      updateProject: vi.fn(),
      removeProject: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      removeTask: vi.fn(),
      dragTaskOnProject: vi.fn(),
      setCurrentBoardId: vi.fn(),
      addBoard: vi.fn(),
      updateBoard: vi.fn(),
      removeBoard: vi.fn(),
      setFilter: vi.fn(),
      setMyBoards: vi.fn(),
      setTeamBoards: vi.fn(),
      resetInBoards: vi.fn()
    };

    vi.mocked(useWorkspaceStore).mockImplementation((selector: any) => {
      return selector ? selector(workspaceStoreState) : workspaceStoreState;
    });
    (useWorkspaceStore as any).getState = () => workspaceStoreState;

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: { pathname: "/en/login", href: "" },
      writable: true,
      configurable: true
    });

    // Mock document.cookie
    Object.defineProperty(document, "cookie", {
      get: vi.fn(() => ""),
      configurable: true
    });

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("should call login and redirect on successful submission", async () => {
    const { result } = renderHook(() => useAuthForm(), { wrapper });

    const mockLocation = { pathname: "/en/login", href: "" };
    Object.defineProperty(window, "location", {
      writable: true,
      value: mockLocation
    });

    // Call handleSubmit - note it doesn't wait for the setTimeout
    const submitPromise = result.current.handleSubmit("test@example.com");

    // Wait for login to be called and complete
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith("test@example.com");
    });

    // Wait for the handleSubmit promise to resolve
    await submitPromise;

    // Wait for redirect to happen (the setTimeout adds 100ms delay)
    await waitFor(
      () => {
        expect(mockLocation.href).toBe("/en/boards?login_success=true");
      },
      { timeout: 2000, interval: 50 }
    );
  });

  it("should handle login failure without redirecting", async () => {
    vi.mocked(AuthService.login).mockRejectedValue(new Error("Login failed"));

    const { result } = renderHook(() => useAuthForm(), { wrapper });

    const mockLocation = { pathname: "/en/login", href: "" };
    Object.defineProperty(window, "location", {
      writable: true,
      value: mockLocation
    });

    // Call handleSubmit and wait for it to complete
    await result.current.handleSubmit("invalid@example.com");

    // Wait for login to be called
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith("invalid@example.com");
    });

    // Check that no redirect happened
    expect(mockLocation.href).toBe("");
  });
});
