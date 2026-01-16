import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDebounce } from "@/hooks/useDebounce"

describe("useDebounce", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500))
    expect(result.current).toBe("initial")
  })

  it("should debounce value changes with default delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" }
    })

    expect(result.current).toBe("initial")

    // Update the value
    rerender({ value: "updated" })

    // Value should still be the old value immediately after update
    expect(result.current).toBe("initial")

    // Advance time by less than the delay
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe("initial")

    // Advance time to complete the delay
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Now the value should be updated
    expect(result.current).toBe("updated")
  })

  it("should debounce value changes with custom delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: "initial" }
    })

    expect(result.current).toBe("initial")

    rerender({ value: "updated" })
    expect(result.current).toBe("initial")

    act(() => {
      vi.advanceTimersByTime(999)
    })
    expect(result.current).toBe("initial")

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe("updated")
  })

  it("should cancel previous timeout on rapid value changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "value1" }
    })

    expect(result.current).toBe("value1")

    // First update
    rerender({ value: "value2" })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Second update before first completes
    rerender({ value: "value3" })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Third update before second completes
    rerender({ value: "value4" })

    // Should still have initial value
    expect(result.current).toBe("value1")

    // Complete the last timeout
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Should jump directly to the last value
    expect(result.current).toBe("value4")
  })

  it("should handle different value types", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 123 }
    })

    expect(result.current).toBe(123)

    rerender({ value: 456 })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe(456)
  })

  it("should handle object values", () => {
    const obj1 = { name: "test1" }
    const obj2 = { name: "test2" }

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: obj1 }
    })

    expect(result.current).toBe(obj1)

    rerender({ value: obj2 })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe(obj2)
  })

  it("should cleanup timeout on unmount", () => {
    const { unmount } = renderHook(() => useDebounce("test", 500))

    // Should not throw error on unmount
    expect(() =>{  unmount(); }).not.toThrow()
  })
})
