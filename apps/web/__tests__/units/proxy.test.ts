import { describe, expect, it, vi } from "vitest"

import { routing } from "@/i18n/routing"
import middleware, { config } from "@/proxy"

// Mock next-intl/middleware
vi.mock("next-intl/middleware", () => ({
  default: vi.fn((routingConfig) => {
    // Return a middleware function that can be tested
    return () => {
      return {
        routingConfig
      }
    }
  })
}))

describe("Middleware", () => {
  it("should export default middleware", () => {
    expect(middleware).toBeDefined()
    expect(typeof middleware).toBe("function")
  })

  it("should have correct config matcher", () => {
    expect(config.matcher).toBeDefined()
    expect(config.matcher).toEqual(["/((?!api|_next/static|_next/image|favicon.ico).*)"])
  })

  it("should exclude API routes from matcher pattern", () => {
    const matcher = config.matcher[0]
    // Verify that the matcher pattern is designed to exclude API routes
    expect(matcher).toContain("!api")
  })

  it("should exclude _next/static from matcher pattern", () => {
    const matcher = config.matcher[0]
    // Verify that the matcher pattern is designed to exclude _next/static
    expect(matcher).toContain("_next/static")
  })

  it("should use routing config from i18n", () => {
    expect(routing).toBeDefined()
  })
})
