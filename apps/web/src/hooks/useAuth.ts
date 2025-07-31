'use client';

import { ROUTES } from '@/constants/routes';
import {
  AuthService,
  type Session,
  type User
} from '@/lib/services/auth.service';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
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
        if (typeof window !== 'undefined') {
          Cookies.set('jwt', data.access_token, { expires: 7, path: '/' });
        }
        return data;
      } catch (err) {
        console.error('Login error:', err);
        setError(err instanceof Error ? err.message : 'Login failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.session() });
      router.push(ROUTES.BOARDS.ROOT);
    }
  });

  // Logout function
  const logout = useCallback(() => {
    AuthService.logout();
    queryClient.setQueryData(AUTH_KEYS.session(), null);
    router.push(ROUTES.AUTH.LOGIN);
  }, [queryClient, router]);

  // Update user info in store when session changes
  useEffect(() => {
    if (session?.user) {
      setUserInfo(session.user.email);
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
      await login(email);
      setUserInfo(email);

      // Use startTransition for smoother navigation
      startNavigationTransition(true);
      router.push(ROUTES.BOARDS.ROOT);
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
