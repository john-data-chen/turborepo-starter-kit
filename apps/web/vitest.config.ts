import { createRequire } from "module";
import path from "path";

import type { ViteUserConfig } from "vitest/config";
import { defineConfig } from "vitest/config";

import rootConfigRaw from "../../vitest.config";

// Cast to ViteUserConfig to avoid type mismatch from duplicate vitest installations
const rootConfig = rootConfigRaw as ViteUserConfig;

// Use require.resolve to dynamically locate React wherever pnpm stores it.
// path.resolve(__dirname, './node_modules/react') breaks in CI where pnpm
// may not create a local symlink. require.resolve follows Node's resolution
// algorithm and works in all pnpm hoisting modes.
const require = createRequire(import.meta.url);
const reactPath = path.dirname(require.resolve("react/package.json"));
const reactDomPath = path.dirname(require.resolve("react-dom/package.json"));

export default defineConfig({
  ...rootConfig,
  test: {
    ...rootConfig.test,
    include: ["__tests__/**/*.test.{ts,tsx}"],
    exclude: ["__tests__/e2e/**"],
    setupFiles: ["./vitest.setup.ts"],
    environment: "jsdom",
    // test.alias takes precedence over resolve.alias for test files.
    // Pinning react here ensures hooks in Zustand / @repo/store
    // always reference the same React dispatcher.
    alias: {
      ...rootConfig.test?.alias,
      react: reactPath,
      "react-dom": reactDomPath
    },
    coverage: {
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/layout.tsx",
        "src/**/page.tsx",
        "src/**/template.tsx",
        "src/**/error.tsx",
        "src/**/loading.tsx",
        "src/**/not-found.tsx",
        "__tests__/**/",
        "src/components/ui/**/",
        "src/hooks/use-mobile.ts",
        "src/types/**/",
        "src/components/kanban/board/**",
        "src/components/kanban/task/TaskAction.tsx",
        "src/components/kanban/project/ProjectAction.tsx",
        "src/lib/config/**"
      ],
      thresholds: {
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      ...rootConfig.resolve?.alias,
      "@": path.resolve(__dirname, "./src"),
      "@repo/ui/components": path.resolve(__dirname, "../../packages/ui/src/components/ui"),
      "@repo/ui/lib": path.resolve(__dirname, "../../packages/ui/src/lib"),
      "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
      // Pin React and all sub-path imports to the same resolved copy
      react: reactPath,
      "react-dom": reactDomPath,
      "react/jsx-runtime": path.resolve(reactPath, "jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(reactPath, "jsx-dev-runtime"),
      "react-dom/client": path.resolve(reactDomPath, "client")
    }
  }
});
