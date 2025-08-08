'use client';

import { ROUTES } from '@/constants/routes';
import { routing } from '@/i18n/routing';
import { AuthService } from '@/lib/auth/authService';
import { getLocalePath } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Session, UserInfo } from '@/types/dbInterface';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Helper function to get current locale from pathname
function getCurrentLocale(): string {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const currentLocale = pathSegments[0];

  return routing.locales.includes(currentLocale as any)
    ? currentLocale
    : routing.defaultLocale;
}

// Helper function to create session from user data
function createSession(user: UserInfo): Session {
  return {
    user: {
      _id: user._id,
      email: user.email,
      name: user.name || user.email.split('@')[0]
    },
    accessToken: 'http-only-cookie'
  };
}

// Helper function to update stores with user data
function updateStoresWithUser(
  user: UserInfo,
  setUserInfo: (name: string, id: string) => void
) {
  setUserInfo(user.name || user.email, user._id);
  useAuthStore.getState().setUser(user);
}

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
      const currentSession = createSession(user);
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

  // Check for existing session on mount only if we have a JWT cookie
  useEffect(() => {
    const initAuth = async () => {
      // Check for authentication cookie (could be jwt= or isAuthenticated=)
      const hasAuthCookie = document.cookie.split(';').some((item) => {
        const trimmed = item.trim();
        return (
          trimmed.startsWith('jwt=') || trimmed.startsWith('isAuthenticated=')
        );
      });

      if (hasAuthCookie) {
        try {
          await checkSession();
        } catch (error) {
          console.error('Failed to check session on mount:', error);
        }
      } else {
        // No authentication cookie, set loading to false immediately
        setIsCheckingAuth(false);
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
        const session = createSession(user);
        return { session };
      } catch (err) {
        console.error('Login error:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
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
      }
    },
    onError: (error) => {
      console.error('Login mutation error:', error);
      setError(error.message);
    }
  });

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear the JWT cookie
      await AuthService.logout();

      // Clear the local session state
      setSession(null);

      // Clear the stores
      useAuthStore.getState().clear();
      useWorkspaceStore.getState().setUserInfo('', '');

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
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (email: string) => {
    try {
      setIsNavigating(true);
      const result = await login(email);

      if (!result?.session?.user) {
        throw new Error('No user data received after login');
      }

      // Get current locale and construct redirect path
      const locale = getCurrentLocale();
      const redirectPath = getLocalePath('/boards', locale);

      // Navigate to boards page
      router.push(redirectPath);
    } catch (err) {
      // Error is already handled by useAuth hook
    } finally {
      setIsNavigating(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    error,
    isNavigating
  };
}
