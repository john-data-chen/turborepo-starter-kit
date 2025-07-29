'use client';

import { ROUTES } from '@/constants/routes';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  user: User;
  accessToken: string;
}

interface AuthStore {
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

const API_BASE = ROUTES.API;

// Create the auth store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
      error: null,
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        session: state.session
      })
    }
  )
);

// API functions
async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Request failed');
    if (typeof window !== 'undefined' && response.status === 401) {
      Cookies.remove('jwt');
    }
    throw new Error(error || 'Request failed');
  }

  return response.json();
}

// React Query hooks
export function useSession() {
  return useQuery<Session | null>({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const token = Cookies.get('jwt');
      if (!token) return null;

      try {
        const user = await fetchWithAuth<User>(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return { user, accessToken: token };
      } catch (error) {
        console.error('Session validation error:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

// Import the implementations from the queries file
import { useLogin as useLoginQuery, useLogout as useLogoutQuery } from '@/lib/api/auth/queries';

export function useLogin() {
  // Delegate to the implementation in queries.ts
  return useLoginQuery();
}

export function useLogout() {
  // Delegate to the implementation in queries.ts
  return useLogoutQuery();
}

// Main auth hook
export function useAuth() {
  const { data: session, isLoading: isSessionLoading } = useSession();
  const {
    mutateAsync: login,
    isPending: isLoggingIn,
    error: loginError
  } = useLogin();
  const {
    mutateAsync: logout,
    isPending: isLoggingOut,
    error: logoutError
  } = useLogout();
  const { setSession } = useAuthStore();

  // Sync session with auth store
  useEffect(() => {
    setSession(session || null);
  }, [session, setSession]);

  return {
    session,
    isAuthenticated: !!session,
    isLoading: isSessionLoading || isLoggingIn || isLoggingOut,
    error: loginError || logoutError || null,
    login: async (email: string) => {
      const { access_token } = await login(email);
      return { accessToken: access_token };
    },
    logout: async () => {
      await logout();
      setSession(null);
    }
  };
}

// Sync auth store with session
export function useSyncAuthStore() {
  const { setSession } = useAuthStore();
  const { data: session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      setSession(session || null);
    }
  }, [session, isLoading, setSession]);
}
