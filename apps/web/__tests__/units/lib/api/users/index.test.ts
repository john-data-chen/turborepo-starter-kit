import { describe, expect, it } from "vitest"

import * as usersModule from "@/lib/api/users"

describe("users index exports", () => {
  it("should export useUser hook", () => {
    expect(usersModule.useUser).toBeDefined()
    expect(typeof usersModule.useUser).toBe("function")
  })

  it("should export useUserSearch hook", () => {
    expect(usersModule.useUserSearch).toBeDefined()
    expect(typeof usersModule.useUserSearch).toBe("function")
  })

  it("should export userApi", () => {
    expect(usersModule.userApi).toBeDefined()
    expect(typeof usersModule.userApi).toBe("object")
  })

  it("should have all expected exports", () => {
    const expectedExports = ["useUser", "useUserSearch", "userApi"]
    expectedExports.forEach((exportName) => {
      expect(usersModule).toHaveProperty(exportName)
    })
  })
})
