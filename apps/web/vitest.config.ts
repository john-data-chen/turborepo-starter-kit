import path from "path";

import { defineConfig } from "vitest/config";

import rootConfig from "../../vitest.config";

export default defineConfig({
  ...rootConfig,
  test: {
    ...rootConfig.test,
    include: ["__tests__/**/*.test.{ts,tsx}"],
    exclude: ["__tests__/e2e/**"],
    setupFiles: ["../../vitest.setup.ts"],
    environment: "jsdom",
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
      "@repo/ui": path.resolve(__dirname, "../../packages/ui/src")
    }
  }
});
