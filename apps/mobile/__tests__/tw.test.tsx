import { describe, it, expect, vi } from "vitest";

import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Link,
  ActivityIndicator,
  useCSSVariable
} from "@/lib/tw";

// Mock react-native-css
vi.mock("react-native-css", () => ({
  useCssElement: vi.fn((_comp, props) => props),
  useNativeVariable: vi.fn((v: string) => v)
}));

// Mock react-native
vi.mock("react-native", () => ({
  View: "View",
  Text: "Text",
  Pressable: "Pressable",
  ScrollView: "ScrollView",
  TextInput: "TextInput",
  ActivityIndicator: "ActivityIndicator"
}));

// Mock expo-router
vi.mock("expo-router", () => ({
  Link: "Link"
}));

describe("tw components", () => {
  it("should export all CSS-wrapped components", () => {
    expect(View).toBeDefined();
    expect(Text).toBeDefined();
    expect(Pressable).toBeDefined();
    expect(ScrollView).toBeDefined();
    expect(TextInput).toBeDefined();
    expect(Link).toBeDefined();
    expect(ActivityIndicator).toBeDefined();
  });

  it("should have displayName set on each component", () => {
    expect(View.displayName).toBe("CSS(View)");
    expect(Text.displayName).toBe("CSS(Text)");
    expect(ScrollView.displayName).toBe("CSS(ScrollView)");
    expect(Pressable.displayName).toBe("CSS(Pressable)");
    expect(TextInput.displayName).toBe("CSS(TextInput)");
    expect(Link.displayName).toBe("CSS(Link)");
    expect(ActivityIndicator.displayName).toBe("CSS(ActivityIndicator)");
  });

  it("should call useCssElement when invoked", async () => {
    const { useCssElement } = await import("react-native-css");
    const spy = vi.mocked(useCssElement);
    spy.mockClear();

    View({ className: "test-class" });
    expect(spy).toHaveBeenCalledWith("View", { className: "test-class" }, { className: "style" });

    Text({ className: "text-class" });
    expect(spy).toHaveBeenCalledWith("Text", { className: "text-class" }, { className: "style" });
  });

  it("should pass contentContainerClassName for ScrollView", async () => {
    const { useCssElement } = await import("react-native-css");
    const spy = vi.mocked(useCssElement);
    spy.mockClear();

    ScrollView({ className: "sv", contentContainerClassName: "cc" });
    expect(spy).toHaveBeenCalledWith(
      "ScrollView",
      { className: "sv", contentContainerClassName: "cc" },
      { className: "style", contentContainerClassName: "contentContainerStyle" }
    );
  });

  it("should export useCSSVariable", () => {
    expect(useCSSVariable).toBeDefined();
    // In non-web environment, useCSSVariable should use useNativeVariable
    const result = useCSSVariable("--color-bg");
    expect(result).toBe("--color-bg");
  });
});
