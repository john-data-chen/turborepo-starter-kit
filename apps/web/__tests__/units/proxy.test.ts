import type { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { routing } from "@/i18n/routing";
import middleware, { config } from "@/proxy";

// Mock next-intl/middleware
vi.mock("next-intl/middleware", () => ({
  default: vi.fn((routingConfig) => {
    // Return a middleware function that can be tested
    return (req: unknown) => {
      return {
        intlHandled: true,
        routingConfig,
        req
      };
    };
  })
}));

function makeRequest(pathname: string, cookies: Record<string, string> = {}): NextRequest {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
    cookies: {
      get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined)
    }
  } as unknown as NextRequest;
}

describe("Middleware", () => {
  it("should export default middleware", () => {
    expect(middleware).toBeDefined();
    expect(typeof middleware).toBe("function");
  });

  it("should have correct config matcher", () => {
    expect(config.matcher).toBeDefined();
    expect(config.matcher).toEqual(["/((?!api|_next/static|_next/image|favicon.ico).*)"]);
  });

  it("should exclude API routes from matcher pattern", () => {
    const matcher = config.matcher[0];
    // Verify that the matcher pattern is designed to exclude API routes
    expect(matcher).toContain("!api");
  });

  it("should exclude _next/static from matcher pattern", () => {
    const matcher = config.matcher[0];
    // Verify that the matcher pattern is designed to exclude _next/static
    expect(matcher).toContain("_next/static");
  });

  it("should use routing config from i18n", () => {
    expect(routing).toBeDefined();
  });
});

describe("proxy execution", () => {
  it("skips auth for /login route and delegates to intl middleware", () => {
    const res = middleware(makeRequest("/en/login")) as { intlHandled?: boolean };
    expect(res.intlHandled).toBe(true);
  });

  it("skips auth for /api route", () => {
    const res = middleware(makeRequest("/api/health")) as { intlHandled?: boolean };
    expect(res.intlHandled).toBe(true);
  });

  it("skips auth for /_next route", () => {
    const res = middleware(makeRequest("/_next/static/x.js")) as { intlHandled?: boolean };
    expect(res.intlHandled).toBe(true);
  });

  it("delegates to intl middleware when jwt cookie present", () => {
    const res = middleware(makeRequest("/en/boards", { jwt: "tok" })) as {
      intlHandled?: boolean;
    };
    expect(res.intlHandled).toBe(true);
  });

  it("delegates to intl middleware when isAuthenticated cookie present", () => {
    const res = middleware(makeRequest("/en/boards", { isAuthenticated: "true" })) as {
      intlHandled?: boolean;
    };
    expect(res.intlHandled).toBe(true);
  });

  it("redirects to login (preserving valid locale + callbackUrl) when unauthenticated", () => {
    const res = middleware(makeRequest("/de/boards"));
    const location = (res as Response).headers.get("location") ?? "";
    expect(location).toContain("/de/login");
    expect(location).toContain("callbackUrl=%2Fde%2Fboards");
  });

  it("falls back to default locale when path locale is invalid", () => {
    const res = middleware(makeRequest("/unknown/boards"));
    const location = (res as Response).headers.get("location") ?? "";
    expect(location).toContain("/en/login");
  });
});
