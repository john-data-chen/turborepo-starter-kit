import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAuthStore, type StorageAdapter } from "@repo/store";

/**
 * AsyncStorage adapter for Zustand's persist middleware.
 * Bridges React Native's async storage to Zustand's StateStorage interface.
 */
const asyncStorageAdapter: StorageAdapter = {
  getItem: async (name: string) => {
    return AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  }
};

/**
 * Mobile auth store — persists to AsyncStorage instead of localStorage.
 */
export const useAuthStore = createAuthStore(asyncStorageAdapter);
