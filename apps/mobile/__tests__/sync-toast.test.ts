import { describe, it, expect, vi, beforeEach } from "vitest";

// Import fresh module state by resetting modules before each test
describe("sync toast suppress flag", () => {
  let suppressNextSyncToast: () => void;
  let consumeSuppressFlag: () => boolean;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const mod = await import("@/hooks/use-sync-toast");
    suppressNextSyncToast = mod.suppressNextSyncToast;
    consumeSuppressFlag = mod.consumeSuppressFlag;
  });

  it("returns false when no suppression set", () => {
    expect(consumeSuppressFlag()).toBe(false);
  });

  it("suppresses one call then resets", () => {
    suppressNextSyncToast();
    expect(consumeSuppressFlag()).toBe(true);
    expect(consumeSuppressFlag()).toBe(false);
  });

  it("clears flag after timeout", () => {
    suppressNextSyncToast();
    vi.advanceTimersByTime(15_000);
    expect(consumeSuppressFlag()).toBe(false);
  });

  it("resets timeout on repeated suppress", () => {
    suppressNextSyncToast();
    vi.advanceTimersByTime(10_000);
    suppressNextSyncToast(); // reset timer
    vi.advanceTimersByTime(10_000); // 20s total, but only 10s since last suppress
    expect(consumeSuppressFlag()).toBe(true);
  });
});
