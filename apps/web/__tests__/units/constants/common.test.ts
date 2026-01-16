import { describe, expect, it } from "vitest";

import { DEBOUNCE_DELAY_MS, SEARCH_DEBOUNCE_DELAY_MS } from "@/constants/common";

describe("common constants", () => {
  it("should have correct DEBOUNCE_DELAY_MS value", () => {
    expect(DEBOUNCE_DELAY_MS).toBe(500);
    expect(typeof DEBOUNCE_DELAY_MS).toBe("number");
  });

  it("should have correct SEARCH_DEBOUNCE_DELAY_MS value", () => {
    expect(SEARCH_DEBOUNCE_DELAY_MS).toBe(300);
    expect(typeof SEARCH_DEBOUNCE_DELAY_MS).toBe("number");
  });

  it("should have SEARCH_DEBOUNCE_DELAY_MS less than DEBOUNCE_DELAY_MS", () => {
    expect(SEARCH_DEBOUNCE_DELAY_MS).toBeLessThan(DEBOUNCE_DELAY_MS);
  });
});
