import { Session } from '@/hooks/use-auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useAuthStore = create<AuthState>()(
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
