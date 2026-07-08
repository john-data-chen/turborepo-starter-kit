# AI Guidelines

## Behavioral Framework

- **MANDATORY**: Load `caveman` skill (global, every session) + `karpathy-guidelines` (every coding task) before any work
- Use MCP servers when they save time (see MCP section).
- Convention first: analyze existing patterns before changes
- Verify, then act: never assume deps/commands exist — check package.json/config
- Test-driven: find tests → run → understand → write tests → implement
- Incremental verification: lint, type-check, test, build after each significant change

> [!TIP]
> Package info → use `context7-mcp`. Next.js project → call `init` from next-devtools-mcp FIRST (confirm with user).

## Skill Dispatch Guide

Load matching skill **before writing code**.

### Universal (ALWAYS CHECK FIRST)

| Condition                                                             | Skill                 |
| :-------------------------------------------------------------------- | :-------------------- |
| **Every session/task** — token optimization, terse communication      | `caveman`             |
| **Any coding task** — writing, refactoring, fixing bugs               | `karpathy-guidelines` |
| Task handoff, session continuity, progress tracking, multi-step plans | `session-handoff`     |

### API (check `ai-docs/api-context.md`)

| Condition                                                                        | Skill                   |
| :------------------------------------------------------------------------------- | :---------------------- |
| NestJS modules, DI, guards, pipes, interceptors, Mongoose, testing, architecture | `nestjs-best-practices` |

### Mobile (check `ai-docs/mobile-context.md`)

| Condition                                                                 | Skill                  |
| :------------------------------------------------------------------------ | :--------------------- |
| Expo screens, navigation, animations, native tabs, styling, layout        | `building-native-ui`   |
| Server-side API endpoints in Expo Router, EAS Hosting, Cloudflare Workers | `expo-api-routes`      |
| Custom dev client builds, TestFlight distribution, native modules         | `expo-dev-client`      |
| Tailwind CSS / NativeWind setup in Expo                                   | `expo-tailwind-setup`  |
| Network requests, API calls, fetch, caching, offline, auth tokens         | `native-data-fetching` |
| Upgrading Expo SDK, dependency conflicts, New Architecture migration      | `upgrading-expo`       |
| Web code on native via webview, Canvas/WebGL, web library migration       | `use-dom`              |

### Web

| Condition                                                                          | Skill                         |
| :--------------------------------------------------------------------------------- | :---------------------------- |
| Next.js file conventions, RSC, data fetching, metadata, route handlers, async APIs | `next-best-practices`         |
| `use cache`, PPR, cacheLife, cacheTag, updateTag, static/dynamic mix               | `next-cache-components`       |
| Component API design, compound components, boolean prop cleanup, render props      | `vercel-composition-patterns` |
| React/Next.js perf: re-renders, bundle size, waterfalls, memoization               | `vercel-react-best-practices` |
| UI review, a11y audit, UX compliance, design guidelines                            | `web-design-guidelines`       |
| Turborepo pipelines, caching, filtering, monorepo structure                        | `turborepo`                   |

## MCP Servers

| Server            | Use When                                                                         |
| :---------------- | :------------------------------------------------------------------------------- |
| `context7`        | Need current library/package docs                                                |
| `next-devtools`   | Dev server diagnostics, route inspection. Call `init` FIRST (confirm with user). |
| `chrome-devtools` | Browser debugging, DOM inspection, performance, network                          |

## Project Overview

### Repo Structure

| Type | Package                    | Description                                                          |
| ---- | -------------------------- | -------------------------------------------------------------------- |
| App  | `apps/api`                 | Nest.js (Express) — see `ai-docs/api-context.md`                     |
| App  | `apps/web`                 | Next.js AppRouter                                                    |
| App  | `apps/mobile`              | React Native (Expo + React latest) — see `ai-docs/mobile-context.md` |
| Pkg  | `packages/global-tsconfig` | TS configs                                                           |
| Pkg  | `packages/i18n`            | Shared i18n (EN/DE), locale config, Messages type                    |
| Pkg  | `packages/store`           | Domain types, Zustand stores, StorageAdapter                         |
| Pkg  | `packages/ui`              | Shadcn UI (web-only, not mobile)                                     |

**Stack**: TypeScript strict, PNPM, Turborepo, Vitest, Playwright, Zustand + TanStack Query, React Hook Form + Zod

## Naming

| Type                | Convention  | Example                   |
| ------------------- | ----------- | ------------------------- |
| Components (web)    | PascalCase  | `DatePicker.tsx`          |
| Components (mobile) | kebab-case  | `board-card.tsx`          |
| Utilities           | camelCase   | `dateUtils.ts`            |
| Constants           | UPPER_SNAKE | `API_ENDPOINTS.ts`        |
| Types               | PascalCase  | `UserData`, `ApiResponse` |
| Hooks (mobile)      | kebab-case  | `use-auth.ts`             |

### Exports

```typescript
// packages/ui/package.json → "exports": { "./ComponentName": "./src/ComponentName/index.ts" }
// Usage: import { ComponentName } from "@repo/ui/ComponentName";
```

## Commands

```bash
pnpm install          # Install deps
pnpm lint --fix       # Fix lint
pnpm test             # Run tests
pnpm build            # Prod build
pnpm turbo clean      # Clean cache
pnpm lint-staged      # Lint+format (stage files first)
```

> [!NOTE]
> Dev server already running via `pnpm dev`. API uses Rspack with hot reload.

## Pitfalls

> [!CAUTION]
> **Shadcn UI**: Modify `packages/ui/src/styles/globals.css` and `apps/web/src/components` first. Shadcn components = last resort.

> [!CAUTION]
> **next-intl nav**: `router.push()`/`router.replace()` from `@/i18n/navigation` auto-prepends locale. Use `"/boards"` NOT `"/en/boards"`.

> [!NOTE]
> **Single QueryClient**: Only `providers/client-providers.tsx` creates it. No second instance.

## Commit Workflow

> [!IMPORTANT]
> [Conventional Commits](https://conventionalcommits.org/): `feat(scope): desc` / `fix(scope): desc`

1. `git add /path/to/file`
2. `pnpm lint-staged && pnpm build --filter=@repo/web`
3. Fix all lint errors/warnings
4. `git reset`
5. Suggest commit message (never auto-commit)
