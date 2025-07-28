import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AuthService from './auth';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      login: async (email: string) => {
        try {
          const { access_token } = await AuthService.login(email);
          const user = await AuthService.getProfile(access_token);
          set({ user, token: access_token });
        } catch (error) {
          console.error('Login failed:', error);
          get().logout();
          throw error;
        }
      },

      logout: () => {
        AuthService.logout();
        set({ user: null, token: null });
      },

      initialize: async () => {
        if (typeof window === 'undefined') return;

        try {
          const session = await AuthService.getSession();
          if (session) {
            set({
              user: session.user,
              token: session.accessToken,
              isLoading: false
            });
          } else {
            set({ user: null, token: null, isLoading: false });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({ user: null, token: null, isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
);

// Initialize auth state when the store is created
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}
