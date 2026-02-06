// 1. Load Environment Variables
// Load the app-local .env.test instead of the root (which doesn't exist).
// The existence check prevents the ENOENT console noise in CI.
import fs from "fs";
import path from "path";

import dotenv from "dotenv";

const envTestPath = path.resolve(__dirname, ".env.test");

if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath });
} else {
  // Fallback: ensure essential env vars are always defined for tests
  process.env.NEXT_PUBLIC_WEB_URL ??= "http://localhost:3000";
  process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:3001";
}

// 2. Testing Library Setup
import "@testing-library/jest-dom/vitest";

import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, vi, expect } from "vitest";

// Extend Vitest's expect method with testing-library matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// 3. Browser Environment Mocks
// Mock ResizeObserver
window.ResizeObserver =
  window.ResizeObserver ||
  vi.fn().mockImplementation(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn()
  }));

// Mock matchMedia
window.matchMedia =
  window.matchMedia ||
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));

// 4. Component & Library Mocks

// Mock @repo/ui components using async factories with vi.importActual
// to avoid no-require-imports lint warnings
vi.mock("@repo/ui/components/button", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    Button: ({ children, className, onClick, ...props }: any) =>
      React.createElement("button", { className, onClick, ...props }, children)
  };
});

vi.mock("@repo/ui/components/card", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    Card: ({ children, className, onClick }: any) =>
      React.createElement("div", { className, onClick }, children),
    CardHeader: ({ children }: any) => React.createElement("div", null, children),
    CardTitle: ({ children }: any) => React.createElement("h3", null, children),
    CardContent: ({ children }: any) => React.createElement("div", null, children)
  };
});

vi.mock("@repo/ui/components/input", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    Input: (props: any) => React.createElement("input", props)
  };
});

vi.mock("@repo/ui/components/select", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    Select: ({ children, value, onValueChange }: any) =>
      React.createElement(
        "div",
        { "data-value": value, onClick: () => onValueChange?.("test") },
        children
      ),
    SelectTrigger: ({ children, ...props }: any) => React.createElement("div", props, children),
    SelectValue: ({ placeholder }: any) => React.createElement("span", null, placeholder),
    SelectContent: ({ children }: any) => React.createElement("div", null, children),
    SelectItem: ({ children, value, ...props }: any) =>
      React.createElement("div", { ...props, "data-value": value }, children)
  };
});

vi.mock("@repo/ui/components/skeleton", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  return {
    Skeleton: ({ className }: any) =>
      React.createElement("div", { className, "data-testid": "skeleton" })
  };
});

// Mock next/navigation
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn()
    })),
    usePathname: vi.fn(() => "/"),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    redirect: vi.fn(),
    permanentRedirect: vi.fn()
  };
});
