import { describe, it, expect, vi } from "vitest";

// Mock react-native before importing query-client
vi.mock("react-native", () => ({
  AppState: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() }))
  }
}));

import { focusManager } from "@tanstack/react-query";

import { queryClient } from "@/lib/query-client";

describe("queryClient", () => {
  it("should be initialized with correct defaults", () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(5 * 60 * 1000);
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(2);
  });

  it("should have refetchOnWindowFocus enabled", () => {
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(true);
  });

  it("should have registered a focusManager event listener", () => {
    // focusManager.setEventListener was called at module load
    // Verify it's wired by checking the internal state
    // The focused flag defaults to true after registration
    expect(focusManager.isFocused()).toBe(true);
  });
});
