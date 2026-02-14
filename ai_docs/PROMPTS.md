# AI Guidelines

## AI Assistant Behavioral Framework

- **Check MCP/skills before execution**:
  - Verify available and enabled tools
  - Suggest and confirm with the user which MCP/skill to use
  - Recommend missing ones if useful
- **Convention First**: Always analyze existing patterns, libraries, and code style before making changes
- **Verify, Then Act**: Never assume dependencies or commands exist - always verify through package.json or config files
- **Test-Driven Changes**: Look for existing tests, run them to understand behavior, write tests before implementing features
- **Incremental Verification**: Run lint, type-check, test, and build commands after every significant change

> [!TIP]
> If need to check package info, use `context7-mcp` if installed and enabled.
> When starting work on a Next.js project, call the `init` tool from next-devtools-mcp FIRST to set up proper context and establish documentation requirements. Ask user for confirmation before calling the tool.

## Skill Dispatch Guide

When a task matches conditions below, load the corresponding skill **before writing code**.

### Web Skills (`ai_docs/skills/web/`)

| Condition (when the task involves...)                                              | Skill to Use                  |
| :--------------------------------------------------------------------------------- | :---------------------------- |
| Next.js file conventions, RSC, data fetching, metadata, route handlers, async APIs | `next-best-practices`         |
| `use cache` directive, PPR, cacheLife, cacheTag, updateTag, static/dynamic mix     | `next-cache-components`       |
| Component API design, compound components, boolean prop cleanup, render props      | `vercel-composition-patterns` |
| React/Next.js performance: re-renders, bundle size, waterfalls, memoization        | `vercel-react-best-practices` |
| UI review, accessibility audit, UX compliance, design guidelines                   | `web-design-guidelines`       |

### Mobile Skills (`ai_docs/skills/mobile/`)

| Condition (when the task involves...)                                       | Skill to Use           |
| :-------------------------------------------------------------------------- | :--------------------- |
| Expo screens, navigation, animations, native tabs, styling, layout patterns | `building-native-ui`   |
| Server-side API endpoints in Expo Router, EAS Hosting, Cloudflare Workers   | `expo-api-routes`      |
| Custom dev client builds, TestFlight distribution, native modules           | `expo-dev-client`      |
| Setting up or configuring Tailwind CSS / NativeWind in Expo                 | `expo-tailwind-setup`  |
| Any network request, API call, fetch, caching, offline support, auth tokens | `native-data-fetching` |
| Upgrading Expo SDK, fixing dependency conflicts, New Architecture migration | `upgrading-expo`       |
| Running web code on native via webview, Canvas/WebGL, web library migration | `use-dom`              |

## Project Overview

### Repository Structure

| Type        | Package                    | Description                                          |
| ----------- | -------------------------- | ---------------------------------------------------- |
| **App**     | `apps/api`                 | Nest.js (Express)                                    |
| **App**     | `apps/web`                 | Next.js AppRouter                                    |
| **App**     | `apps/mobile`              | React Native (Expo) app                              |
| **Package** | `packages/global-tsconfig` | TypeScript configurations                            |
| **Package** | `packages/store`           | Domain types, Zustand stores, StorageAdapter pattern |
| **Package** | `packages/ui`              | Shadcn UI Shared UI                                  |

#### Shadcn UI Components

The Shadcn UI components are in `packages/ui/components/ui`. They are a UI library - modify `packages/ui/src/styles/globals.css` and `apps/web/src/components` first, only modify Shadcn components as a last resort.

## Essential Commands

### Daily Development

```bash
pnpm install                          # Install all dependencies
pnpm lint --fix                       # Fix lint errors
pnpm test                             # Run tests
pnpm build                            # Build for production
```

> [!NOTE]
> Dev server is already running via `pnpm dev`, no need to start it again.

### Debugging & Verification

```bash
pnpm turbo clean                      # Clean build cache
git add /path/to/your/file.ts         # Stage file for linting
pnpm lint-staged                      # Run linter and formatter
```

## Technology Stack

| Category               | Technology                                      |
| ---------------------- | ----------------------------------------------- |
| **Runtime**            | Node.js latest (check with `node -v`)           |
| **Frontend Framework** | Next.js (App Router) + React                    |
| **Backend Framework**  | Nest.js (Express)                               |
| **Mobile Framework**   | React Native (Expo)                             |
| **Language**           | TypeScript (strict mode)                        |
| **Styling**            | TailwindCSS                                     |
| **Package Manager**    | PNPM (not npm/yarn)                             |
| **Monorepo**           | Turborepo                                       |
| **Unit Test**          | Vitest                                          |
| **E2E Test**           | Playwright                                      |
| **State**              | Zustand (global), TanStack Query (server state) |
| **Forms**              | React Hook Form + Zod                           |

## Naming Conventions

| Type       | Convention  | Example                   |
| ---------- | ----------- | ------------------------- |
| Components | PascalCase  | `DatePicker.tsx`          |
| Utilities  | camelCase   | `dateUtils.ts`            |
| Constants  | UPPER_SNAKE | `API_ENDPOINTS.ts`        |
| Types      | PascalCase  | `UserData`, `ApiResponse` |

### Export Pattern

```typescript
// packages/ui/package.json
{
  "exports": {
    "./ComponentName": "./src/ComponentName/index.ts"
  }
}

// Usage in apps
import { ComponentName } from "@repo/ui/ComponentName";
```

## Debugging Checklist

> [!NOTE]
> API uses Rspack with auto hot reload - no restart needed after modifications.

1. **Read Actual Source**: Always read component source before assumptions
2. **Trace Data Flow**: User interaction → component state → props → parent state
3. **Check useEffect**: Look for state resets or conflicting side effects
4. **Controlled vs Uncontrolled**: Identify hybrid components with internal + prop state
5. **State Location**: Verify if issue is in child component logic vs parent state

```bash
# Check component usage patterns
grep -r "ComponentName" apps/forms/src/
```

## Commit Workflow

> [!IMPORTANT]
> Follow [Conventional Commits](https://conventionalcommits.org/) specification.
> Format: `feat(scope): description` / `fix(scope): description`

**After completing changes:**

1. Stage files: `git add /path/to/your/file`
2. Verify: `pnpm lint-staged && pnpm build --filter=@repo/web`
3. Fix all linter errors/warnings
4. Unstage files: `git reset`
5. Suggest commit message (never commit automatically)

## Quality Checklist

- [ ] All commands run without errors
- [ ] TypeScript strict mode compliance
- [ ] Follows existing code patterns
- [ ] Proper component export structure
- [ ] Conventional commit messages
- [ ] No lint warnings or build errors
