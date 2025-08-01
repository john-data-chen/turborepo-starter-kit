import { Session, UserInfo } from '@/types/dbInterface';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  user: UserInfo | null;
  setSession: (session: Session | null) => void;
  setUser: (user: UserInfo | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      isLoading: false,
      error: null,
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clear: () =>
        set({
          session: null,
          user: null,
          isLoading: false,
          error: null
        })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        session: state.session
      })
    }
  )
);
