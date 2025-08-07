'use client';

import { ROUTES } from '@/constants/routes';
import { AuthService } from '@/lib/auth/authService';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Session, UserInfo } from '@/types/dbInterface';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
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
  const queryClient = useQueryClient();
  const setUserInfo = useWorkspaceStore((state) => state.setUserInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const { data: session, isLoading: isCheckingAuth } = useQuery<Session | null>(
    {
      queryKey: AUTH_KEYS.session(),
      queryFn: () => AuthService.getSession(),
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (email: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await AuthService.login(email);
        // The JWT is now set as an HTTP-only cookie by the server
        // Get user profile after successful login
        const user = await AuthService.getProfile();
        return { ...data, user };
      } catch (err) {
        console.error('Login error:', err);
        setError(err instanceof Error ? err.message : 'Login failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      // Update the session data with the user info
      queryClient.setQueryData(AUTH_KEYS.session(), {
        user: data.user,
        accessToken: 'http-only-cookie' // The actual token is in the HTTP-only cookie
      });
      // Update the workspace store
      setUserInfo(data.user.name || data.user.email, data.user._id);
      // Redirect to boards page
      router.push(ROUTES.BOARDS.OVERVIEW_PAGE);
    }
  });

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear the JWT cookie
      AuthService.logout();

      // Clear all query cache to ensure no stale data remains
      await queryClient.cancelQueries();
      queryClient.removeQueries();

      // Clear the session data
      queryClient.setQueryData(AUTH_KEYS.session(), null);

      // Clear the auth store if you're using one
      const { clear: clearAuthStore } = useAuthStore.getState();
      clearAuthStore();

      // Clear the workspace store
      const { setUserInfo } = useWorkspaceStore.getState();
      setUserInfo('', '');

      // Redirect to login page
      router.push(ROUTES.AUTH.LOGIN_PAGE);

      // Force a full page reload to ensure all state is cleared
      window.location.href = ROUTES.AUTH.LOGIN_PAGE;
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect even if there was an error
      window.location.href = ROUTES.AUTH.LOGIN_PAGE;
    }
  }, [queryClient, router]);

  // Update user info in store when session changes
  useEffect(() => {
    if (session?.user) {
      // Ensure we have both email and _id before updating
      if (session.user.email && session.user._id) {
        setUserInfo(session.user.email, session.user._id);
      } else {
        console.warn('Session user is missing email or _id:', session.user);
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
      if (result?.user) {
        setUserInfo(result.user.email, result.user._id);
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
