import { createAuthStore } from "@repo/store";

export type { AuthState } from "@repo/store";

/**
 * Web auth store — uses localStorage by default (Zustand's built-in default).
 * No storage adapter needed for web.
 */
export const useAuthStore = createAuthStore();
