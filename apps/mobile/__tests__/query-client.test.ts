import { describe, it, expect } from "vitest";

import { queryClient } from "@/lib/query-client";

describe("queryClient", () => {
  it("should be initialized with correct defaults", () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(5 * 60 * 1000);
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(2);
  });
});
