import { useAuth, useAuthForm } from '@/hooks/useAuth'
import { AuthService } from '@/lib/auth/authService'
import { useAuthStore } from '@/stores/auth-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useMutation } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { expect, vi } from 'vitest'

// Mock the hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
  useAuthForm: vi.fn()
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedUseAuthForm = vi.mocked(useAuthForm)

// Mock external modules
vi.mock('@/lib/auth/authService')
vi.mock('@/stores/auth-store', () => {
  const mockStore = {
    user: null,
    session: null,
    isLoading: false,
    error: null,
    setUser: vi.fn(),
    setSession: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    clear: vi.fn()
  }
  const useAuthStore = vi.fn((selector) => selector(mockStore))
  useAuthStore.getState = vi.fn(() => mockStore)
  return { useAuthStore }
})
vi.mock('@/stores/workspace-store', () => {
  const mockStore = {
    userId: null,
    userEmail: null,
    setUserInfo: vi.fn(),
    projects: [],
    isLoadingProjects: false,
    setProjects: vi.fn(),
    currentBoardId: null,
    myBoards: [],
    teamBoards: [],
    filter: { status: null, search: '' },
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
  }
  const useWorkspaceStore = vi.fn((selector) => selector(mockStore))
  useWorkspaceStore.getState = vi.fn(() => mockStore)
  return { useWorkspaceStore }
})
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useMutation: vi.fn()
  }
})
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: vi.fn()
  }))
}))
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock the getLocalePath function from @repo/ui/lib/utils
vi.mock('@repo/ui/lib/utils', () => ({
  getLocalePath: vi.fn((path) => `/en${path}`)
}))

describe('useAuth', () => {
  const mockUser = { _id: '123', email: 'test@example.com', name: 'Test User' }
  const mockSession = { user: mockUser, accessToken: 'http-only-cookie' }

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mocks for each test
    vi.mocked(AuthService.getProfile).mockResolvedValue(mockUser)
    vi.mocked(AuthService.login).mockResolvedValue({ access_token: 'token', user: mockUser })
    vi.mocked(AuthService.logout).mockResolvedValue(undefined)

    vi.mocked(useAuthStore.getState).mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      error: null,
      setUser: vi.fn(),
      setSession: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clear: vi.fn()
    })

    useWorkspaceStore.getState.mockReturnValue({
      userId: null,
      userEmail: null,
      setUserInfo: vi.fn(),
      projects: [],
      isLoadingProjects: false,
      setProjects: vi.fn(),
      currentBoardId: null,
      myBoards: [],
      teamBoards: [],
      filter: { status: null, search: '' },
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
    })

    vi.mocked(useMutation).mockImplementation((options) => ({
      mutate: vi.fn((variables) => options.onSuccess?.(options.mutationFn(variables), variables, undefined)),
      mutateAsync: vi.fn(async (variables) => {
        const data = await options.mutationFn(variables)
        options.onSuccess?.(data, variables, undefined)
        return data
      }),
      isPending: false,
      isSuccess: false,
      isError: false,
      data: undefined,
      error: null,
      reset: vi.fn(),
      status: 'idle',
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0
    }))

    // Mock window.location.pathname for getCurrentLocale
    Object.defineProperty(window, 'location', {
      value: { pathname: '/en/login' },
      writable: true
    })

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      get: vi.fn(() => 'jwt=mock_jwt; isAuthenticated=true'),
      configurable: true
    })

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => 'mock_token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: undefined,
      session: null,
      login: vi.fn(),
      loginWithEmail: vi.fn(),
      logout: vi.fn(),
      loginMutation: {} as any
    })
  })

  it('should initialize with authenticated state if session exists', async () => {
    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isLoading).toBe(false)
    })

    expect(AuthService.getProfile).toHaveBeenCalled()
    expect(useAuthStore.getState().setUser).toHaveBeenCalledWith(mockUser)
    expect(useWorkspaceStore.getState().setUserInfo).toHaveBeenCalledWith(mockUser.name, mockUser._id)
  })

  it('should initialize with unauthenticated state if no session', async () => {
    vi.mocked(AuthService.getProfile).mockRejectedValue(new Error('No session'))
    Object.defineProperty(document, 'cookie', {
      get: vi.fn(() => ''),
      configurable: true
    })
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
    })

    expect(AuthService.getProfile).toHaveBeenCalled()
    expect(useAuthStore.getState().clear).toHaveBeenCalled()
    expect(useWorkspaceStore.getState().setUserInfo).toHaveBeenCalledWith('', '')
  })

  it('should log in a user successfully', async () => {
    const { result } = renderHook(() => useAuth())

    await result.current.login('test@example.com')

    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith('test@example.com')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
      expect(useAuthStore.getState().setUser).toHaveBeenCalledWith(mockUser)
      expect(useWorkspaceStore.getState().setUserInfo).toHaveBeenCalledWith(mockUser.name, mockUser._id)
      expect(toast.success).not.toHaveBeenCalled() // toast is handled by useAuthForm
    })
  })

  it('should handle login failure', async () => {
    const loginError = new Error('Invalid credentials')
    vi.mocked(AuthService.login).mockRejectedValue(loginError)

    const { result } = renderHook(() => useAuth())

    await result.current.login('wrong@example.com').catch(() => {}) // Catch the error to prevent test failure

    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith('wrong@example.com')
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe('Invalid credentials')
      expect(useAuthStore.getState().setUser).not.toHaveBeenCalled()
      expect(useWorkspaceStore.getState().setUserInfo).not.toHaveBeenCalled()
    })
  })

  it('should log out a user successfully', async () => {
    // Initialize with authenticated state
    vi.mocked(AuthService.getProfile).mockResolvedValue(mockUser)
    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    // Mock window.location.href setter
    const originalWindowLocation = window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalWindowLocation, href: '' }
    })

    await result.current.logout()

    await waitFor(() => {
      expect(AuthService.logout).toHaveBeenCalled()
      expect(useAuthStore.getState().clear).toHaveBeenCalled()
      expect(useWorkspaceStore.getState().setUserInfo).toHaveBeenCalledWith('', '')
      expect(window.location.href).toBe('/login')
    })
  })
})

describe('useAuthForm', () => {
  const mockRouterReplace = vi.fn()
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ replace: mockRouterReplace } as any)
    mockedUseAuthForm.mockReturnValue({
      handleSubmit: mockLogin,
      isLoading: false,
      error: null,
      isNavigating: false
    })

    // Mock window.location.href setter
    const originalWindowLocation = window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalWindowLocation, href: '' }
    })

    // Mock setTimeout
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call login and redirect on successful submission', async () => {
    mockLogin.mockResolvedValue({ session: { user: { _id: '123', email: 'test@example.com' } } })

    const { result } = renderHook(() => mockedUseAuthForm())

    result.current.handleSubmit('test@example.com')

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com')
    })

    // Advance timers to trigger setTimeout
    vi.advanceTimersByTime(100)

    expect(window.location.href).toBe('/en/boards?login_success=true')
  })

  it('should handle login failure without redirecting', async () => {
    mockLogin.mockRejectedValue(new Error('Login failed'))

    const { result } = renderHook(() => mockedUseAuthForm())

    await result.current.handleSubmit('invalid@example.com')

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('invalid@example.com')
      expect(window.location.href).toBe('') // Should not redirect
    })
  })
})
