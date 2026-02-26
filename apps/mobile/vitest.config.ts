import { createRequire } from "module";
import path from "path";

import { defineConfig } from "vitest/config";

// Resolve React from the monorepo root so all packages (including
// @testing-library/react, react-dom, zustand) share a single copy.
// apps/mobile/node_modules/react is a separate copy that causes
// "Invalid hook call" errors when mixed with the root react-dom.
const rootDir = path.resolve(__dirname, "../..");
const rootRequire = createRequire(path.join(rootDir, "node_modules", "index.js"));
const reactPath = path.dirname(rootRequire.resolve("react/package.json"));
const reactDomPath = path.dirname(rootRequire.resolve("react-dom/package.json"));

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    alias: {
      "react-native": "react-native-web",
      react: reactPath,
      "react-dom": reactDomPath,
      "@": path.resolve(__dirname, "./"),
      "@repo/i18n": path.resolve(__dirname, "../../packages/i18n/src"),
      "@repo/store": path.resolve(__dirname, "../../packages/store/src"),
      "@repo/ui": path.resolve(__dirname, "../../packages/ui/src")
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["hooks/**/*.{ts,tsx}", "stores/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts", "**/__tests__/**"],
      thresholds: {
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      "react-native": "react-native-web",
      react: reactPath,
      "react-dom": reactDomPath,
      "react/jsx-runtime": path.resolve(reactPath, "jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(reactPath, "jsx-dev-runtime"),
      "react-dom/client": path.resolve(reactDomPath, "client"),
      "@": path.resolve(__dirname, "./")
    }
  },
  ssr: {
    noExternal: [/zustand/, /@tanstack\/react-query/, /@tanstack\/query-core/, /@testing-library/]
  }
});
