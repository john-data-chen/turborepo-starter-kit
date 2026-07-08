import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("sonner-native", () => ({
  toast: {
    success: vi.fn()
  }
}));

vi.mock("@/lib/i18n", () => ({
  i18n: {
    t: (key: string) => key
  }
}));

import { toast } from "sonner-native";

import { suppressNextSyncToast } from "@/hooks/use-sync-toast";
import { useSyncToastListener } from "@/hooks/use-sync-toast-listener";

describe("useSyncToastListener", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("should not toast on initial render", () => {
    const data = [{ updatedAt: "2026-01-01T00:00:00Z" }];
    renderHook(() => {
      useSyncToastListener(data, true);
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("should toast when data changes", () => {
    const data1 = [{ updatedAt: "2026-01-01T00:00:00Z" }];
    const data2 = [{ updatedAt: "2026-01-02T00:00:00Z" }];

    const { rerender } = renderHook(
      ({ data, enabled }) => {
        useSyncToastListener(data, enabled);
      },
      {
        initialProps: { data: data1, enabled: true }
      }
    );

    // Change data
    rerender({ data: data2, enabled: true });

    expect(toast.success).toHaveBeenCalledWith("sync.synced");
  });

  it("should not toast when data is the same", () => {
    const data = [{ updatedAt: "2026-01-01T00:00:00Z" }];

    const { rerender } = renderHook(
      ({ data, enabled }) => {
        useSyncToastListener(data, enabled);
      },
      {
        initialProps: { data, enabled: true }
      }
    );

    // Same data
    rerender({ data, enabled: true });

    expect(toast.success).not.toHaveBeenCalled();
  });

  it("should not toast when disabled", () => {
    const data1 = [{ updatedAt: "2026-01-01T00:00:00Z" }];
    const data2 = [{ updatedAt: "2026-01-02T00:00:00Z" }];

    const { rerender } = renderHook(
      ({ data, enabled }) => {
        useSyncToastListener(data, enabled);
      },
      {
        initialProps: { data: data1, enabled: false }
      }
    );

    // Change data while disabled
    rerender({ data: data2, enabled: false });

    expect(toast.success).not.toHaveBeenCalled();
  });

  it("should suppress toast when flag is set", () => {
    const data1 = [{ updatedAt: "2026-01-01T00:00:00Z" }];
    const data2 = [{ updatedAt: "2026-01-02T00:00:00Z" }];

    const { rerender } = renderHook(
      ({ data, enabled }) => {
        useSyncToastListener(data, enabled);
      },
      {
        initialProps: { data: data1, enabled: true }
      }
    );

    // Set suppress flag
    suppressNextSyncToast();

    // Change data
    rerender({ data: data2, enabled: true });

    expect(toast.success).not.toHaveBeenCalled();
  });

  it("should not toast when the query key changes (switched board/project)", () => {
    const boardA = [{ updatedAt: "2026-01-01T00:00:00Z" }];
    const boardB = [{ updatedAt: "2026-06-06T00:00:00Z" }];

    const { rerender } = renderHook(
      ({ data, key }) => {
        useSyncToastListener(data, true, key);
      },
      {
        initialProps: { data: boardA, key: "a" }
      }
    );

    // Switch to a different board: data jumps but key changed → rebaseline, no toast
    rerender({ data: boardB, key: "b" });

    expect(toast.success).not.toHaveBeenCalled();
  });

  it("should handle Date objects in updatedAt", () => {
    const data1 = [{ updatedAt: new Date("2026-01-01T00:00:00Z") }];
    const data2 = [{ updatedAt: new Date("2026-01-02T00:00:00Z") }];

    const { rerender } = renderHook(
      ({ data, enabled }) => {
        useSyncToastListener(data, enabled);
      },
      {
        initialProps: { data: data1, enabled: true }
      }
    );

    // Change data with Date objects
    rerender({ data: data2, enabled: true });

    expect(toast.success).toHaveBeenCalledWith("sync.synced");
  });

  it("should handle non-array data", () => {
    const data1: unknown = null;
    const data2 = [{ updatedAt: "2026-01-02T00:00:00Z" }];

    const { rerender } = renderHook(
      ({ data, enabled }) => {
        useSyncToastListener(data, enabled);
      },
      {
        initialProps: { data: data1, enabled: true }
      }
    );

    // Change to array data
    rerender({ data: data2, enabled: true });

    // Should toast because snapshot changed from empty to non-empty
    expect(toast.success).toHaveBeenCalledWith("sync.synced");
  });

  it("should handle empty array data", () => {
    const data1: unknown[] = [];
    const data2 = [{ updatedAt: "2026-01-02T00:00:00Z" }];

    const { rerender } = renderHook(
      ({ data, enabled }) => {
        useSyncToastListener(data, enabled);
      },
      {
        initialProps: { data: data1, enabled: true }
      }
    );

    // Change to non-empty array
    rerender({ data: data2, enabled: true });

    // Should toast because snapshot changed from empty to non-empty
    expect(toast.success).toHaveBeenCalledWith("sync.synced");
  });
});
