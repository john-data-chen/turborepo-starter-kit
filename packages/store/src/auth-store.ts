import type { Session, UserInfo } from "./types.ts";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createStorage, type StorageAdapter } from "./storage.ts";

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

/**
 * Factory that creates the auth store with an injectable storage adapter.
 *
 * @param storage - Platform-specific storage (localStorage for web,
 *                  AsyncStorage wrapper for React Native).
 *                  When omitted, Zustand uses localStorage by default.
 */
export function createAuthStore(storage?: StorageAdapter) {
  return create<AuthState>()(
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
        name: "auth-storage",
        storage: createStorage(storage),
        partialize: (state) => ({
          session: state.session
        })
      }
    )
  );
}
