import { describe, it, expect } from "vitest";

import { APP_NAME, DEFAULT_EMAIL } from "@/constants/app";
import { API_ROUTES } from "@/constants/routes";

describe("constants", () => {
  it("should have correct app constants", () => {
    expect(APP_NAME).toBe("Expo Project Manager");
    expect(DEFAULT_EMAIL).toBe("mark.s@example.com");
  });

  it("should have correct routes", () => {
    expect(API_ROUTES.AUTH.LOGIN).toContain("/auth/login");
  });
});
