import { createJSONStorage, type StateStorage } from "zustand/middleware";

/**
 * Platform-agnostic storage adapter interface.
 *
 * - Web: pass `localStorage` directly (it already satisfies this interface)
 * - React Native: wrap AsyncStorage to match this interface
 *
 * Zustand's persist middleware accepts both sync and async storage,
 * so the same factory works for both platforms.
 */
export type StorageAdapter = StateStorage;

/**
 * Creates a Zustand-compatible JSON storage wrapper from a StorageAdapter.
 * If no adapter is provided, falls back to localStorage (web default).
 */
export function createStorage(adapter?: StorageAdapter) {
  if (!adapter) {
    return undefined;
  }
  return createJSONStorage(() => adapter);
}
