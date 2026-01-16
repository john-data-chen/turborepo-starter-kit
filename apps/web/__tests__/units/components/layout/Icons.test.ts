import { describe, expect, it } from "vitest"

import { Icons } from "@/components/layout/Icons"

describe("Icons", () => {
  it("should export Icons object", () => {
    expect(Icons).toBeDefined()
    expect(typeof Icons).toBe("object")
  })

  it("should have projectLogo icon", () => {
    expect(Icons.projectLogo).toBeDefined()
    expect(typeof Icons.projectLogo).toBe("object")
  })

  it("should have all expected icon properties", () => {
    const expectedIcons = ["projectLogo"]
    expectedIcons.forEach((iconName) => {
      expect(Icons).toHaveProperty(iconName)
    })
  })

  it("should be a React component", () => {
    // Icons should be React components from lucide-react
    expect(Icons.projectLogo).toBeDefined()
    expect(typeof Icons.projectLogo).toBe("object")
  })
})
