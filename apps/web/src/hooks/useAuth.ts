'use client';

import { ROUTES } from '@/constants/routes';
import { AuthService } from '@/lib/auth/authService';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Session, UserInfo } from '@/types/dbInterface';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: UserInfo | null;
  session: Session | null;
}

export const AUTH_KEYS = {
  all: ['auth'] as const,
  session: () => [...AUTH_KEYS.all, 'session'] as const
};

export function useAuth() {
  const router = useRouter();
  const setUserInfo = useWorkspaceStore((state) => state.setUserInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session state
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Function to manually check session
  const checkSession = useCallback(async (): Promise<Session | null> => {
    try {
      setIsCheckingAuth(true);
      const user = await AuthService.getProfile();
      const currentSession: Session = {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name || user.email.split('@')[0]
        },
        accessToken: 'http-only-cookie'
      };
      setSession(currentSession);
      return currentSession;
    } catch (error) {
      console.error('Session check failed:', error);
      setSession(null);
      return null;
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error('Failed to check session on mount:', error);
      }
    };

    initAuth();
  }, [checkSession]);

  // Login mutation
  const loginMutation = useMutation<{ session: Session }, Error, string>({
    mutationFn: async (email: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // First, call the login endpoint which will set the HTTP-only cookie
        await AuthService.login(email);

        // Then, fetch the user profile using the session
        const user = await AuthService.getProfile();
        const session: Session = {
          user: {
            _id: user._id,
            email: user.email,
            name: user.name || user.email.split('@')[0]
          },
          accessToken: 'http-only-cookie' // The actual token is in the HTTP-only cookie
        };

        return { session };
      } catch (err) {
        console.error('Login error:', err);
        setError(err instanceof Error ? err.message : 'Login failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      if (data?.session?.user) {
        const { user } = data.session;
        // Update the local session state
        setSession(data.session);
        // Update the workspace store
        setUserInfo(user.name || user.email, user._id);
        // Update the auth store
        useAuthStore.getState().setUser(user);
        // Redirect to the boards page
        router.push(ROUTES.BOARDS.OVERVIEW_PAGE);
      }
    }
  });

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear the JWT cookie
      await AuthService.logout();

      // Clear the local session state
      setSession(null);

      // Clear the auth store
      const { clear: clearAuthStore } = useAuthStore.getState();
      clearAuthStore();

      // Clear the workspace store
      const { setUserInfo } = useWorkspaceStore.getState();
      setUserInfo('', '');

      // Redirect to login page with a full page reload to ensure all state is cleared
      window.location.href = ROUTES.AUTH.LOGIN_PAGE;
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect even if there was an error
      window.location.href = ROUTES.AUTH.LOGIN_PAGE;
    }
  }, []); // Removed router dependency since we're using window.location

  // Update user info in store when session changes
  useEffect(() => {
    if (session?.user) {
      const { user } = session;
      // Ensure we have both email and _id before updating
      if (user.email && user._id) {
        setUserInfo(user.name || user.email, user._id);
      } else {
        console.warn('Session user is missing email or _id:', user);
      }
    }
  }, [session, setUserInfo]);

  return {
    // Auth state
    isAuthenticated: !!session,
    isLoading: isCheckingAuth || isLoading,
    error,
    user: session?.user,
    session,

    // Auth methods
    login: loginMutation.mutateAsync,
    loginWithEmail: loginMutation.mutateAsync, // Alias for backward compatibility
    logout,

    // Raw mutations for more control
    loginMutation
  };
}

export function useAuthForm() {
  const { login, isLoading, error } = useAuth();
  const [isNavigating, startNavigationTransition] = useState(false);
  const router = useRouter();
  const setUserInfo = useWorkspaceStore((state) => state.setUserInfo);

  const handleSubmit = async (email: string) => {
    try {
      const result = await login(email);
      // The login mutation now returns the user profile
      if (result?.session?.user) {
        setUserInfo(result.session.user.email, result.session.user._id);
      } else {
        // Fallback to just setting the email if user data is not available
        setUserInfo(email, '');
      }

      // Use startTransition for smoother navigation
      startNavigationTransition(true);
      router.push(ROUTES.BOARDS.OVERVIEW_PAGE);
    } catch (err) {
      console.error('Login failed:', err);
      // Error is already handled by the login mutation
    } finally {
      startNavigationTransition(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    error,
    isNavigating
  };
}
